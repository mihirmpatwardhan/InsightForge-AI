import pandas as pd
import numpy as np
from typing import Dict, List, Any, Union


def basic_clean_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """Cleans dataframe by stripping column names, removing empty rows, and intelligently converting dates."""
    df = df.copy()
    df.dropna(how="all", inplace=True)
    df.columns = [str(col).strip() for col in df.columns]

    for col in df.columns:
        if df[col].dtype == "object":
            # Avoid converting purely numeric strings or short codes (like years '2022', IDs '1001') to dates
            sample_non_null = df[col].dropna().astype(str)
            if sample_non_null.empty:
                continue

            # Check if values look numeric or year-like
            is_numeric_like = sample_non_null.str.match(r"^\d+$").all()
            if is_numeric_like:
                continue

            try:
                converted = pd.to_datetime(df[col], errors="coerce", format="mixed")
                valid_ratio = converted.notna().sum() / len(df)
                if valid_ratio > 0.7:
                    df[col] = converted
            except Exception:
                pass

    return df


def get_column_types(df: pd.DataFrame) -> Dict[str, List[str]]:
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    datetime_cols = df.select_dtypes(include=["datetime64[ns]", "datetime64[ns, UTC]"]).columns.tolist()
    categorical_cols = [col for col in df.columns if col not in numeric_cols and col not in datetime_cols]

    return {
        "numeric": numeric_cols,
        "categorical": categorical_cols,
        "datetime": datetime_cols
    }


def calculate_data_health(df: pd.DataFrame) -> Dict[str, Any]:
    """Calculates an overall data quality score (0 to 100) and provides diagnostic stats."""
    if df.empty:
        return {"score": 0, "status": "Empty Dataset", "duplicate_rows": 0, "missing_cells": 0, "total_cells": 0}

    total_cells = df.size
    missing_cells = int(df.isnull().sum().sum())
    duplicate_rows = int(df.duplicated().sum())

    missing_penalty = (missing_cells / total_cells) * 50 if total_cells > 0 else 0
    duplicate_penalty = (duplicate_rows / len(df)) * 30 if len(df) > 0 else 0

    score = max(0, min(100, int(100 - missing_penalty - duplicate_penalty)))

    if score >= 85:
        status = "Excellent"
    elif score >= 70:
        status = "Good"
    elif score >= 50:
        status = "Fair"
    else:
        status = "Needs Cleaning"

    return {
        "score": score,
        "status": status,
        "duplicate_rows": duplicate_rows,
        "missing_cells": missing_cells,
        "total_cells": total_cells,
        "completeness_pct": round(100 * (1 - missing_cells / total_cells), 1) if total_cells > 0 else 0
    }


def dataset_profile(df: pd.DataFrame) -> Dict[str, Any]:
    types = get_column_types(df)
    missing = df.isnull().sum()
    missing = missing[missing > 0].sort_values(ascending=False)
    health = calculate_data_health(df)

    summary = {
        "rows": int(df.shape[0]),
        "columns": int(df.shape[1]),
        "numeric_columns": types["numeric"],
        "categorical_columns": types["categorical"],
        "datetime_columns": types["datetime"],
        "missing_values": missing.to_dict(),
        "describe_numeric": df[types["numeric"]].describe().round(2).to_dict() if types["numeric"] else {},
        "top_categories": {},
        "health": health
    }

    for col in types["categorical"][:5]:
        try:
            summary["top_categories"][col] = df[col].astype(str).value_counts().head(5).to_dict()
        except Exception:
            summary["top_categories"][col] = {}

    return summary


def grouped_aggregation(df: pd.DataFrame, group_cols: Union[str, List[str]], value_col: str, agg_func: str) -> pd.DataFrame:
    """Performs grouped aggregation supporting single or multiple grouping columns."""
    if isinstance(group_cols, str):
        group_cols = [group_cols]

    # Filter valid columns
    valid_groups = [c for c in group_cols if c in df.columns]
    if not valid_groups or value_col not in df.columns:
        return df

    grouped = (
        df.groupby(valid_groups, dropna=False)[value_col]
        .agg(agg_func)
        .reset_index()
    )
    return grouped.sort_values(by=value_col, ascending=False)


def clean_missing_values(df: pd.DataFrame, strategy: str = "drop_rows") -> pd.DataFrame:
    """Fills or drops missing values based on chosen strategy."""
    cleaned = df.copy()
    if strategy == "drop_rows":
        cleaned = cleaned.dropna()
    elif strategy == "fill_numeric_mean":
        types = get_column_types(cleaned)
        for col in types["numeric"]:
            cleaned[col] = cleaned[col].fillna(cleaned[col].mean())
    elif strategy == "fill_numeric_median":
        types = get_column_types(cleaned)
        for col in types["numeric"]:
            cleaned[col] = cleaned[col].fillna(cleaned[col].median())
    elif strategy == "fill_mode":
        for col in cleaned.columns:
            mode_val = cleaned[col].mode()
            if not mode_val.empty:
                cleaned[col] = cleaned[col].fillna(mode_val[0])
    return cleaned


def auto_chart_suggestions(df: pd.DataFrame) -> List[str]:
    types = get_column_types(df)
    suggestions = []

    if types["datetime"] and types["numeric"]:
        suggestions.append("📈 Use a Line Chart for time series trend analysis.")
    if types["categorical"] and types["numeric"]:
        suggestions.append("📊 Use a Bar Chart to compare categorical metrics.")
        suggestions.append("📦 Use a Box Plot to detect outliers and distribution per category.")
    if len(types["numeric"]) >= 2:
        suggestions.append("Scatter Plot: Explore linear relationships between numeric variables.")
        suggestions.append("🔥 Heatmap: Inspect overall correlation matrix.")
    if types["categorical"]:
        suggestions.append("🍩 Pie / Donut Chart: View proportional distribution of categories.")

    return suggestions
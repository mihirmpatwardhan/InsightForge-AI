import pandas as pd
from typing import List, Dict, Tuple


def load_uploaded_files(uploaded_files) -> Dict[str, pd.DataFrame]:
    dataframes = {}

    for file in uploaded_files:
        file_name = file.name

        try:
            if file_name.lower().endswith(".csv"):
                df = None
                for encoding in ["utf-8", "latin1", "cp1252", "iso-8859-1"]:
                    try:
                        file.seek(0)
                        df = pd.read_csv(file, encoding=encoding)
                        break
                    except (UnicodeDecodeError, Exception):
                        continue
                if df is None:
                    continue
                df.columns = [str(col).strip() for col in df.columns]
                dataframes[file_name] = df

            elif file_name.lower().endswith((".xlsx", ".xls")):
                excel_file = pd.ExcelFile(file)
                for sheet_name in excel_file.sheet_names:
                    df = pd.read_excel(excel_file, sheet_name=sheet_name)
                    df.columns = [str(col).strip() for col in df.columns]
                    key_name = f"{file_name} ({sheet_name})" if len(excel_file.sheet_names) > 1 else file_name
                    dataframes[key_name] = df

        except Exception as e:
            print(f"Error loading {file_name}: {e}")

    return dataframes


def get_common_columns(dfs: Dict[str, pd.DataFrame]) -> List[str]:
    if not dfs:
        return []

    column_sets = [set(df.columns) for df in dfs.values()]
    common_cols = set.intersection(*column_sets) if column_sets else set()
    return sorted(list(common_cols))


def merge_dataframes(dfs: Dict[str, pd.DataFrame]) -> Tuple[pd.DataFrame, str]:
    if not dfs:
        return pd.DataFrame(), "No files uploaded."

    common_cols = get_common_columns(dfs)
    if not common_cols:
        return pd.DataFrame(), "No common columns found for merge."

    aligned = []
    for file_name, df in dfs.items():
        temp = df[common_cols].copy()
        temp["source_file"] = file_name
        aligned.append(temp)

    merged_df = pd.concat(aligned, ignore_index=True)
    return merged_df, f"Merged {len(dfs)} files using {len(common_cols)} common columns."
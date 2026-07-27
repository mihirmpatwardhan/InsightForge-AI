import numpy as np
from typing import List, Dict, Any


def linear_forecast(values: List[float], periods: int = 30) -> Dict[str, Any]:
    """
    Performs linear regression forecast with 80% confidence intervals.
    Returns fitted values, forecast values, and confidence bands.
    """
    if len(values) < 3:
        return {"error": "Need at least 3 data points for forecasting."}

    n = len(values)
    x = np.arange(n, dtype=float)
    y = np.array(values, dtype=float)

    # Remove NaNs
    mask = ~np.isnan(y)
    x_clean = x[mask]
    y_clean = y[mask]

    if len(x_clean) < 3:
        return {"error": "Insufficient non-null data points."}

    # Linear regression (least squares)
    coeffs = np.polyfit(x_clean, y_clean, 1)
    slope, intercept = coeffs

    # Fitted values on original range
    y_fitted = slope * x_clean + intercept

    # Residual standard error
    residuals = y_clean - y_fitted
    sse = np.sum(residuals ** 2)
    dof = len(x_clean) - 2
    sigma = np.sqrt(sse / dof) if dof > 0 else 0

    # 80% confidence interval multiplier (t-distribution ~ 1.282 for large n)
    z = 1.282

    # Future forecast
    x_future = np.arange(n, n + periods, dtype=float)
    y_forecast = slope * x_future + intercept

    # Confidence bands for forecast
    x_mean = np.mean(x_clean)
    ss_x = np.sum((x_clean - x_mean) ** 2)
    n_fit = len(x_clean)

    ci_upper = []
    ci_lower = []
    for idx, xf in enumerate(x_future):
        se = sigma * np.sqrt(1 + 1/n_fit + (xf - x_mean)**2 / (ss_x + 1e-8))
        ci_upper.append(float(y_forecast[idx] + z * se))
        ci_lower.append(float(y_forecast[idx] - z * se))

    r_squared = 1 - (np.sum(residuals**2) / (np.sum((y_clean - np.mean(y_clean))**2) + 1e-8))

    # Determine trend direction
    if slope > 0:
        trend = "Upward 📈"
    elif slope < 0:
        trend = "Downward 📉"
    else:
        trend = "Flat ➡️"

    return {
        "slope": round(float(slope), 4),
        "intercept": round(float(intercept), 4),
        "r_squared": round(float(r_squared), 4),
        "confidence": 80,
        "trend": trend,
        "fitted_indices": x_clean.tolist(),
        "fitted_values": y_fitted.tolist(),
        "forecast_indices": x_future.tolist(),
        "forecast_values": y_forecast.tolist(),
        "ci_upper": ci_upper,
        "ci_lower": ci_lower,
    }


def detect_anomalies(values: List[float], threshold_sigma: float = 2.5) -> Dict[str, Any]:
    """
    Detects outliers using Z-score method.
    Returns indices and values of anomalies.
    """
    arr = np.array(values, dtype=float)
    valid = arr[~np.isnan(arr)]
    if len(valid) == 0:
        return {"anomalies": [], "stats": {}}

    mean = np.mean(valid)
    std = np.std(valid)
    if std == 0:
        return {"anomalies": [], "stats": {"mean": float(mean), "std": 0}}

    z_scores = np.abs((arr - mean) / std)
    anomaly_indices = np.where(z_scores > threshold_sigma)[0].tolist()
    anomaly_values = arr[anomaly_indices].tolist()

    return {
        "anomalies": [{"index": int(i), "value": float(v), "z_score": float(z_scores[i])} for i, v in zip(anomaly_indices, anomaly_values)],
        "stats": {
            "mean": round(float(mean), 4),
            "std": round(float(std), 4),
            "threshold_sigma": threshold_sigma,
            "total_points": len(arr),
            "anomaly_count": len(anomaly_indices)
        }
    }

import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score
from sklearn.utils import resample

def score_companies(companies_df: pd.DataFrame, target_df: pd.DataFrame) -> pd.DataFrame:
    companies_df["label"] = companies_df["domain"].isin(target_df["domain"]).astype(int)

    df_pos = companies_df[companies_df.label == 1]
    df_neg = companies_df[companies_df.label == 0]
    df_neg_downsampled = resample(df_neg, replace=False, n_samples=len(df_pos)*5, random_state=42)
    df_train = pd.concat([df_pos, df_neg_downsampled])

    features = [col for col in companies_df.columns if col not in ["name", "domain", "label"]]
    X = df_train[features].fillna(0)
    y = df_train["label"]

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X, y)

    companies_df["score"] = model.predict_proba(companies_df[features].fillna(0))[:, 1]
    return companies_df.sort_values("score", ascending=False)[["name", "domain", "score", "funding", "headcount"]]

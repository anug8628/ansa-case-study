import pandas as pd
import numpy as np

def get_scored_companies():
    # Simulating a scoring model
    # Sample data (you should replace this with your actual dataset and logic)
    df = pd.read_csv("data/companies.csv")
    
    # Simulate a score based on a feature (e.g., domain length or another metric)
    df["score"] = df["domain"].apply(lambda x: len(x))  # Example scoring based on domain length
    
    # Sorting by score (Descending)
    df_sorted = df.sort_values(by="score", ascending=False)
    
    # Convert to a list of dictionaries (to be served as JSON)
    companies = df_sorted[["name", "domain", "score"]].to_dict(orient="records")
    
    return companies

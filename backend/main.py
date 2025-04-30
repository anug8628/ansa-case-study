from flask import Flask, jsonify
from model.preprocess import load_data, scale_features
from model.scorer import compute_similarity, attach_scores

# Define relevant features
# TODO: find relevant features
features = [
    'funding_total',
    'headcount_growth_6m',
    'linkedin_follower_count',
    'gpt_sector' 
]

# Load and process data
company_data, target_data, company_features, target_features = load_data(
    './data/company_data.parquet',
    './data/target_company_data.parquet',
    features
)

company_scaled, target_scaled = scale_features(company_features, target_features)
similarity_matrix = compute_similarity(company_scaled, target_scaled)
company_data = attach_scores(company_data, similarity_matrix)

print(company_data)

app = Flask(__name__)

@app.route('/api/companies', methods=['GET'])
def get_companies():
    scored = company_data[['company_id', 'company_name', 'similarity_score']].sort_values(by='similarity_score', ascending=False)
    return jsonify(scored.to_dict(orient='records'))

@app.route('/api/company/<int:company_id>', methods=['GET'])
def get_company(company_id):
    match = company_data[company_data['company_id'] == company_id]
    if not match.empty:
        return jsonify(match.to_dict(orient='records')[0])
    return jsonify({'error': 'Company not found'}), 404

if __name__ == '__main__':
    app.run(debug=True)

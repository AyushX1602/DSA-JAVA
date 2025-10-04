import pandas as pd
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.utils.class_weight import compute_class_weight
from datetime import datetime
from sklearn.model_selection import train_test_split

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


class FoodSurplusPredictor:
    def __init__(self, data_path):
        self.df = self._load_and_preprocess(data_path)
        self.model, self.features = self._train_model()
        self.locations = self._get_location_stats()
        
    def _load_and_preprocess(self, path):
        df = pd.read_csv(path)
        df['date'] = pd.to_datetime(df['date'])
        df['time'] = pd.to_datetime(df['time'], format='%H:%M').dt.hour
        
        df['day_of_year'] = df['date'].dt.dayofyear
        df['week_of_year'] = df['date'].dt.isocalendar().week
        df['month'] = df['date'].dt.month
        df['is_weekend'] = df['date'].dt.weekday >= 5
        
        df['day_sin'] = np.sin(2 * np.pi * df['day_of_year']/365)
        df['day_cos'] = np.cos(2 * np.pi * df['day_of_year']/365)
        
        event_strength = {'Diwali': 2.5, 'Pune Festival': 2.0, 'Eid': 1.8, 'Ganesh Chaturthi': 2.2, None: 1.0}
        df['event_strength'] = df['event'].map(event_strength)
        
        df['hist_avg'] = df.groupby('neighborhood')['surplus_kg'].transform('mean')
        
        return df.dropna()
    
    def _get_location_stats(self):
        stats = self.df.groupby('neighborhood').agg({
            'latitude': 'mean',
            'longitude': 'mean',
            'surplus_kg': ['mean', 'std']
        })
        return {
            'latitude': stats['latitude']['mean'].to_dict(),
            'longitude': stats['longitude']['mean'].to_dict(),
            'surplus_kg': {
                'mean': stats['surplus_kg']['mean'].to_dict(),
                'std': stats['surplus_kg']['std'].to_dict()
            }
        }
    
    def _train_model(self):
        features = ['day_sin', 'day_cos', 'week_of_year', 'month', 'is_weekend', 'event_strength', 'hist_avg', 'time']
        
        train_df, test_df = train_test_split(self.df, test_size=0.2, shuffle=False)
        
        class_weights = compute_class_weight('balanced', classes=np.unique(train_df['neighborhood']), y=train_df['neighborhood'])
        weight_dict = dict(zip(np.unique(train_df['neighborhood']), class_weights))
        
        model = Pipeline([
            ('preprocess', ColumnTransformer([
                ('num', SimpleImputer(strategy='median'), features)
            ])),
            ('classifier', RandomForestClassifier(n_estimators=300, max_depth=7, class_weight=weight_dict, random_state=42))
        ])
        
        model.fit(train_df[features], train_df['neighborhood'])
        return model, features
    
    def predict(self, input_date):
        try:
            date_obj = datetime.strptime(input_date, '%Y-%m-%d')
            day_of_year = date_obj.timetuple().tm_yday
            week_of_year = date_obj.isocalendar()[1]
            month = date_obj.month
            is_weekend = date_obj.weekday() >= 5
            
            X = pd.DataFrame([{
                'day_sin': np.sin(2 * np.pi * day_of_year/365),
                'day_cos': np.cos(2 * np.pi * day_of_year/365),
                'week_of_year': week_of_year,
                'month': month,
                'is_weekend': is_weekend,
                'event_strength': self._get_event_strength(month),
                'hist_avg': self.df['hist_avg'].mean(),
                'time': 12
            }])
            
            probs = self.model.predict_proba(X)[0]
            classes = self.model.named_steps['classifier'].classes_
            top3 = sorted(zip(classes, probs), key=lambda x: -x[1])[:3]
            
            predictions = []
            for neigh, prob in top3:
                predictions.append({
                    'neighborhood': neigh,
                    'probability': round(prob, 2),
                    'latitude': round(self.locations['latitude'][neigh], 4),
                    'longitude': round(self.locations['longitude'][neigh], 4),
                    'reasons': self._get_reasons(X, neigh, date_obj)
                })
            
            return predictions
        except Exception as e:
            return {'error': str(e)}
    
    def _get_event_strength(self, month):
        event_map = {1: 2.0, 2: 2.0, 8: 2.2, 9: 2.2, 10: 2.5, 11: 2.5, 4: 1.8, 5: 1.8}
        return event_map.get(month, 1.0)
    
    def _get_reasons(self, X, neighborhood, date_obj):
        importances = self.model.named_steps['classifier'].feature_importances_
        reasons = []
        
        season = self._get_season(date_obj)
        reasons.append(f"{season} season pattern")
        
        for feat, imp in sorted(zip(self.features, importances), key=lambda x: -x[1])[:2]:
            if feat == 'month':
                reasons.append(f"Typical {date_obj.strftime('%B')} surplus behavior")
            elif feat == 'event_strength':
                event = self._get_event_name(date_obj.month)
                if event:
                    reasons.append(f"Upcoming {event} preparations")
        
        avg = self.locations['surplus_kg']['mean'][neighborhood]
        reasons.append(f"Historical average: {avg:.1f}kg")
        
        return reasons[:3]
    
    def _get_season(self, date):
        yday = date.timetuple().tm_yday
        if yday < 80 or yday >= 355: return 'Winter'
        if yday < 172: return 'Spring'
        if yday < 266: return 'Summer'
        return 'Autumn'
    
@app.route('/predict', methods=['GET'])
def predict():
    input_date = request.args.get('date')
    if not input_date:
        return jsonify({'error': 'Please provide a date in YYYY-MM-DD format'}), 400
    predictions = predictor.predict(input_date)
    return jsonify(predictions)

if __name__ == '__main__':
    predictor = FoodSurplusPredictor('food_surplus_data.csv')
    app.run(debug=True, port=5004)




# import pandas as pd
# import numpy as np
# from sklearn.ensemble import RandomForestClassifier
# from sklearn.pipeline import Pipeline
# from sklearn.compose import ColumnTransformer
# from sklearn.impute import SimpleImputer
# from sklearn.utils.class_weight import compute_class_weight
# from datetime import datetime
# from sklearn.model_selection import train_test_split

# class FoodSurplusPredictor:
#     def __init__(self, data_path):
#         self.df = self._load_and_preprocess(data_path)
#         self.model, self.features = self._train_model()
#         self.locations = self._get_location_stats()
        
#     def _load_and_preprocess(self, path):
#         df = pd.read_csv(path)
#         df['date'] = pd.to_datetime(df['date'])
#         df['time'] = pd.to_datetime(df['time'], format='%H:%M').dt.hour
        
#         # Enhanced temporal features
#         df['day_of_year'] = df['date'].dt.dayofyear
#         df['week_of_year'] = df['date'].dt.isocalendar().week
#         df['month'] = df['date'].dt.month
#         df['is_weekend'] = df['date'].dt.weekday >= 5
        
#         # Cyclical encoding
#         df['day_sin'] = np.sin(2 * np.pi * df['day_of_year']/365)
#         df['day_cos'] = np.cos(2 * np.pi * df['day_of_year']/365)
        
#         # Event impact
#         event_strength = {
#             'Diwali': 2.5, 'Pune Festival': 2.0, 
#             'Eid': 1.8, 'Ganesh Chaturthi': 2.2, 
#             None: 1.0
#         }
#         df['event_strength'] = df['event'].map(event_strength)
        
#         # Historical patterns
#         df['hist_avg'] = df.groupby('neighborhood')['surplus_kg'].transform('mean')
        
#         return df.dropna()
    
#     def _get_location_stats(self):
#         stats = self.df.groupby('neighborhood').agg({
#             'latitude': 'mean',
#             'longitude': 'mean',
#             'surplus_kg': ['mean', 'std']
#         })
#         return {
#             'latitude': stats['latitude']['mean'].to_dict(),
#             'longitude': stats['longitude']['mean'].to_dict(),
#             'surplus_kg': {
#                 'mean': stats['surplus_kg']['mean'].to_dict(),
#                 'std': stats['surplus_kg']['std'].to_dict()
#             }
#         }
    
#     def _train_model(self):
#         features = ['day_sin', 'day_cos', 'week_of_year', 
#                    'month', 'is_weekend', 'event_strength', 
#                    'hist_avg', 'time']
        
#         # Split data with temporal validation
#         train_df, test_df = train_test_split(
#             self.df, test_size=0.2, shuffle=False
#         )
        
#         # Class weights
#         class_weights = compute_class_weight(
#             'balanced', 
#             classes=np.unique(train_df['neighborhood']),
#             y=train_df['neighborhood']
#         )
#         weight_dict = dict(zip(np.unique(train_df['neighborhood']), class_weights))

#         # Model pipeline
#         model = Pipeline([
#             ('preprocess', ColumnTransformer([
#                 ('num', SimpleImputer(strategy='median'), features)
#             ])),
#             ('classifier', RandomForestClassifier(
#                 n_estimators=300,
#                 max_depth=7,
#                 class_weight=weight_dict,
#                 random_state=42
#             ))
#         ])
        
#         model.fit(train_df[features], train_df['neighborhood'])
#         return model, features
    
#     def predict(self, input_date):
#         try:
#             date_obj = datetime.strptime(input_date, '%Y-%m-%d')
#             day_of_year = date_obj.timetuple().tm_yday
#             week_of_year = date_obj.isocalendar()[1]
#             month = date_obj.month
#             is_weekend = date_obj.weekday() >= 5
            
#             X = pd.DataFrame([{
#                 'day_sin': np.sin(2 * np.pi * day_of_year/365),
#                 'day_cos': np.cos(2 * np.pi * day_of_year/365),
#                 'week_of_year': week_of_year,
#                 'month': month,
#                 'is_weekend': is_weekend,
#                 'event_strength': self._get_event_strength(month),
#                 'hist_avg': self.df['hist_avg'].mean(),
#                 'time': 12  # Default to noon
#             }])
            
#             probs = self.model.predict_proba(X)[0]
#             classes = self.model.named_steps['classifier'].classes_
#             top3 = sorted(zip(classes, probs), key=lambda x: -x[1])[:3]
            
#             predictions = []
#             for neigh, prob in top3:
#                 predictions.append({
#                     'neighborhood': neigh,
#                     'probability': round(prob, 2),
#                     'latitude': round(self.locations['latitude'][neigh], 4),
#                     'longitude': round(self.locations['longitude'][neigh], 4),
#                     'reasons': self._get_reasons(X, neigh, date_obj)
#                 })
            
#             return predictions
            
#         except Exception as e:
#             print(f"Prediction error: {str(e)}")
#             return []
    
#     def _get_event_strength(self, month):
#         event_map = {
#             1: 2.0, 2: 2.0,  # Pune Festival
#             8: 2.2, 9: 2.2,  # Ganesh Chaturthi
#             10: 2.5, 11: 2.5,  # Diwali
#             4: 1.8, 5: 1.8  # Eid
#         }
#         return event_map.get(month, 1.0)
    
#     def _get_reasons(self, X, neighborhood, date_obj):
#         importances = self.model.named_steps['classifier'].feature_importances_
#         reasons = []
        
#         # Temporal reasons
#         month = date_obj.strftime('%B')
#         season = self._get_season(date_obj)
#         reasons.append(f"{season} season pattern")
        
#         # Feature-based reasons
#         for feat, imp in sorted(zip(self.features, importances), key=lambda x: -x[1])[:2]:
#             if feat == 'day_sin':
#                 reasons.append(f"Strong {season} donations pattern")
#             elif feat == 'month':
#                 reasons.append(f"Typical {month} surplus behavior")
#             elif feat == 'event_strength':
#                 event = self._get_event_name(date_obj.month)
#                 if event:
#                     reasons.append(f"Upcoming {event} preparations")
        
#         # Historical context
#         avg = self.locations['surplus_kg']['mean'][neighborhood]
#         reasons.append(f"Historical average: {avg:.1f}kg")
            
#         return reasons[:3]
    
#     def _get_season(self, date):
#         yday = date.timetuple().tm_yday
#         if yday < 80 or yday >= 355: return 'Winter'
#         if yday < 172: return 'Spring'
#         if yday < 266: return 'Summer'
#         return 'Autumn'
    
#     def _get_event_name(self, month):
#         events = {
#             1: 'Pune Festival', 8: 'Ganesh Chaturthi',
#             10: 'Diwali', 4: 'Eid'
#         }
#         return events.get(month)

# if __name__ == "__main__":
#     # Initialize predictor
#     predictor = FoodSurplusPredictor('food_surplus_data.csv')
    
#     # Set your input dates here
#     input_dates = ["2024-06-15"]
    
#     for input_date in input_dates:
#         predictions = predictor.predict(input_date)
        
#         if predictions:
#             print(f"\nPredictions for {input_date}:")
#             for idx, pred in enumerate(predictions, 1):
#                 print(f"\n{idx}. {pred['neighborhood']} ({pred['probability']*100}%)")
#                 print(f"   Coordinates: {pred['latitude']}, {pred['longitude']}")
#                 print(f"   Reasons:")
#                 for reason in pred['reasons']:
#                     print(f"   - {reason}")
#         else:
#             print(f"\nNo predictions available for {input_date}. Check data and model.")
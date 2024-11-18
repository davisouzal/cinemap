from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from dotenv import load_dotenv
import os
import requests

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
load_dotenv()

db = SQLAlchemy(app)
migrate = Migrate(app, db)

class Movie(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tmdb_id = db.Column(db.String(80), unique=True, nullable=False)
    status = db.Column(db.String(80), nullable=False)
    rating = db.Column(db.String(80), nullable=True)
    userId = db.Column(db.String(80), nullable=False)
    watchedLocation = db.Column(db.String(80), nullable=True)

@app.route('/', methods=['GET'])
def hello():
    return jsonify({'message': 'Hello, World!'}), 200

@app.route('/movies/searchById/<int:id>', methods=['GET'])
def getMovieById(id):
    try:
        if id is None:
            return jsonify({'error': 'No movie id provided'})
        url = f'https://api.themoviedb.org/3/movie/{id}?language=en-US';
        headers = {
                "accept": "application/json",
                "Authorization": f"Bearer {os.getenv('TOKEN_TMDB_API')}",
            }

        response = requests.get(url, headers=headers)
        response.raise_for_status()
        movie_data = response.json()    

        movie = {
            "id": movie_data.get("id"),
            "title": movie_data.get("title"),
            "overview": movie_data.get("overview"),
            "poster_path": movie_data.get("poster_path"),
            "genres": movie_data.get("genres")[:4] if movie_data.get("genres") else [],
            "year": movie_data.get("release_date").split("-")[0] if movie_data.get("release_date") else "Unknown",
            "runtime": (
                f"{movie_data['runtime'] // 60}h {movie_data['runtime'] % 60}m"
                if movie_data.get("runtime", 0) > 60
                else f"{movie_data.get('runtime')}m" if movie_data.get("runtime") else "Unknown"
            ),
            "production": (
                movie_data["production_companies"][0]["name"]
                if movie_data.get("production_companies") and len(movie_data["production_companies"]) > 0
                else "Unknown"
            ),
            "emptyStars": [0] * int((5 - (movie_data.get("vote_average", 0) // 2))),
            "fullStars": [0] * int((movie_data.get("vote_average", 0) // 2)),
            "hasHalfStar": bool(movie_data.get("vote_average", 0) % 2),
            "vote_average": movie_data.get("vote_average"),
        }

        return jsonify(movie), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/users/movies', methods=['GET'])
def getUserMovies():
    userId = request.args.get('userId')
    status = request.args.get('status')
    try:
        if not status:
            movies = Movie.query.filter_by(userId=userId).all()
        else:
            movies = Movie.query.filter_by(userId=userId, status=status).all()

        movies_data = [{"id": movie.id, "tmdb_id": movie.tmdb_id, "status": movie.status, "rating": movie.rating, "watchedLocation": movie.watchedLocation} for movie in movies]

        return jsonify(movies_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}, 500)

@app.route('/users/movies/<string:tmdbId>', methods=['GET'])
def getUserMovie(tmdbId):
    userId = request.args.get('userId')
    try:
        movie = Movie.query.filter_by(userId=userId, tmdb_id=tmdbId).first()
        if not movie:
            return jsonify({'error': 'Movie not found'}), 404
        
        movie_data = {"id": movie.id, "tmdb_id": movie.tmdb_id, "status": movie.status,"rating": movie.rating, "watchedLocation": movie.watchedLocation}

        return jsonify(movie_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/users/movies/<string:tmdbId>', methods=['POST'])
def addUserMovie(tmdbId):
    userId = request.args.get('userId')
    data = request.get_json()
    status = data.get('status')
    try:
        if not status:
            return jsonify({'error': 'Missing required information'}), 400
        
        foundMovie = Movie.query.filter_by(userId=userId, tmdb_id=tmdbId).first()

        if foundMovie:
            return jsonify({'error': 'Movie already exists'}), 400
        
        print(data)
        
        newMovie = Movie(tmdb_id=tmdbId, status=status, userId=userId)
        db.session.add(newMovie)
        db.session.commit()

        return jsonify({'message': 'Movie added'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/users/movies/<int:movieId>', methods=['DELETE'])
def deleteUserMovie(movieId):
    userId = request.args.get('userId')
    try:
        if not movieId:
            return jsonify({'error': 'No movie id provided'}), 400
        movie = Movie.query.filter_by(id=movieId, userId=userId).first()
        if not movie:
            return jsonify({'error': 'Movie not found'}), 404

        db.session.delete(movie)
        db.session.commit()

        return jsonify({'message': 'Movie deleted'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/users/movies/<int:movieId>', methods=['PUT'])
def updateStatus(movieId):
    userId = request.args.get('userId')
    data = request.get_json()
    status = data.get('status')
    rating = data.get('rating')

    try:
        movie = Movie.query.filter_by(id=movieId, userId=userId).first()
        print(movie)
        if not movie:
            return jsonify({'error': 'Movie not found'}), 404
        if status:
            movie.status = status
        if rating:
            movie.rating = rating
        db.session.commit()

        movie_data = {"id": movie.id, "tmdb_id": movie.tmdb_id, "status": movie.status,"rating": movie.rating, "watchedLocation": movie.watchedLocation}

        return jsonify(movie_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=8002)

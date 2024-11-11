from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import recommendation
 
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get('/')
def endpoints():
    return {"endpoints": [
            {
                "endpoint": "/",
                "method": "GET",
                "description": "get api endpoints, methods and their descriptions",
            },
            {
                "endpoint": "/recommend",
                "method": "POST",
                "description": "send movie data to get recommendations of other movies (receive a list of ids from TMDB)"
            },
            {
                "endpoint": "/explore",
                "method": "POST",
                "description": "send movies with scores to get recommendations of other movies (receive a list of ids from TMDB)"
            }
        ]
    }

@app.post('/recommend')
def recommend_movies_from_movie(movie: recommendation.Movie):
    print('movie:', movie)
    res = recommendation.get_recommended_movies(movie)
    
    res = sorted(res, key=lambda x: x[1], reverse=True)
    res = [r[0] for r in res]
    print('res:',  res)
    return res

@app.post('/explore')
def explore_movies(movies: recommendation.MovieList):
    recommendations = []

    for movie in movies.movies:
        res = recommendation.get_recommended_movies(movie)

        for m in res:
            recommendations.append((m[0], m[1] * recommendation.recommendation_factor(movie.rating, movie.state), movie.title))
    
    recommendations = sorted(recommendations, key=lambda x: x[1], reverse=True)
    print("recommendations:", recommendations)

    res = [recommendation[0] for recommendation in recommendations]
    
    for movie in movies.movies:
        if movie.id in res:
            res.remove(movie.id)

    print('res:',  res)
    return res
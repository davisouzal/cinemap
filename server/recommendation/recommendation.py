from pydantic import BaseModel
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd
from os import path

class Movie(BaseModel):
    id: int
    title: str
    production_companies: list[str]
    keywords: list[str]
    cast: list[str]
    crew: list[str]
    genres: list[str]
    rating: float
    state: str

class MovieList(BaseModel):
    movies: list[Movie]

def preprocess_df(df):
    df['cast'] = df['cast'].str.strip('[]')
    df['cast'] = df['cast'].str.split(', ').str[:5].str.join(', ')
    df['cast'] = df['cast'].str.replace("'", '').str.replace(' ', '').str.lower()

    columns_to_preprocess = ["production_companies", "keywords", "crew", "genres"]

    for column in columns_to_preprocess:
        df[column] = df[column].str.strip('[]')
        df[column] = df[column].str.replace("'", '').str.replace(' ', '')
        df[column] = df[column].str.lower()

def preprocess_movie(movie):
    movie.cast = movie.cast.__str__()[1:-2].replace(' ', '').replace("'", '').lower()

    columns_to_preprocess = ["production_companies", "keywords", "crew", "genres"]

    for column in columns_to_preprocess:
        setattr(movie, column, getattr(movie, column).__str__().strip('[]'))
        setattr(movie, column, getattr(movie, column).__str__().replace("'", '').__str__().replace(' ', ''))
        setattr(movie, column, getattr(movie, column).__str__().lower())

    print('preprocessed movie:', movie)

def get_recommended_movies(movie):
    global df
    # index of the chosen movie title
    df_aux = df.reset_index()
    indices = pd.Series(df_aux.index, index=df_aux['title'])

    # index of the chosen movie title
    index = indices.get(movie.title)

    preprocess_movie(movie)

    if index is None:
        new_movie = {
            'genres': movie.genres,
            'keywords': movie.keywords,
            'title': movie.title,
            'production_companies': movie.production_companies,
            'cast': movie.cast,
            'crew': movie.crew,
            'id': movie.id,
        }

        new_df = pd.DataFrame([new_movie])
        df = pd.concat([new_df, df], ignore_index=True)

        # Update indices after adding a new movie
        df_aux = df.reset_index()
        indices = pd.Series(df_aux.index, index=df_aux['title'])

        # Update index of the new movie
        index = indices.get(movie.title)

    columns_to_concat = ['production_companies', 'keywords', 'cast', 'crew', 'genres']

    # Create a new column "combined_text" by concatenating the specified columns
    df['combined_text'] = df[columns_to_concat].astype(str).apply(lambda row: ' '.join(row), axis=1)

    vectorizer = CountVectorizer(stop_words='english')
    cv_matrix = vectorizer.fit_transform(df['combined_text'])

    cosine_sim_matrix = cosine_similarity(cv_matrix, cv_matrix)

    # Reset index of the main df and create a reverse mapping Series that links movie titles to their corresponding indices in the df
    df_aux = df.reset_index()
    indices = pd.Series(df.index, index=df_aux['title'])

    # Scores of all movies with the chosen movie title
    scores = list(enumerate(cosine_sim_matrix[index]))
    scores = sorted(scores, key=lambda x: x[1], reverse=True)

    # Removing the input movie from the recommendations
    scores = scores[1:]

    # Get the indices of the recommended movies and its cosine values
    movie_indices = [(i[0], i[1]) for i in scores[:NUMBER_OF_RECOMMENDATIONS]]

    # Return the IDs of the recommended movies
    recommended_movie_ids = df['id'].iloc[[movie_ind[0] for movie_ind in movie_indices]].tolist()
    res = []
    for idx, movie_id in enumerate(recommended_movie_ids):
        res.append((movie_id, movie_indices[idx][1]))

    return res

def recommendation_factor(rating: float, state: str):
    state_val = {
        "dropped": -1,
        "plan": 0.2,
        "completed": 0.5,
    }

    return ((rating - 2) ** 3) / 255 + (rating / 4) + state_val[state]

NUMBER_OF_RECOMMENDATIONS = 10

df = pd.read_csv(path.join('data', 'data.csv'))
preprocess_df(df)
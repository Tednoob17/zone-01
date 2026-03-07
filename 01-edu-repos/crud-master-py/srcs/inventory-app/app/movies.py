from flask import (
    Blueprint, request, make_response, jsonify
)
from app.extensions import db

from sqlalchemy.orm.exc import NoResultFound


class Movie(db.Model):
    __tablename__ = "movies"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String())
    description = db.Column(db.String())

    def __init__(self, title, description):
        self.title = title
        self.description = description


bp = Blueprint("movies", __name__)


@bp.route("/api/movies", methods=["GET"])
def get_movies():
    movies = Movie.query.all()
    result = [{
        "id": movie.id,
        "title": movie.title,
        "description": movie.description
    } for movie in movies]

    filter_name = request.args.get("title", None)
    if filter_name is not None:
        result = [movie for movie in result if filter_name in movie['title']]

    return jsonify(movies=result), 200


@bp.route("/api/movies", methods=["POST"])
def post_movies():
    if not request.is_json:
        return make_response(
            jsonify({"error": "body must be json"}), 400
        )

    data = request.get_json()
    try:
        new_movie = Movie(
            title=data["title"], description=data["description"]
        )
        db.session.add(new_movie)
        db.session.commit()
        return make_response(
            jsonify(
                {"message": f"movie {new_movie.title} inserted successfully"}
            ), 201)
    except Exception as inst:
        return make_response(
            jsonify({"error": f"{inst} is required"}), 400
        )


@bp.route("/api/movies", methods=["DELETE"])
def delete_movies():
    try:
        db.session.query(Movie).delete()
        db.session.commit()
        return {"message": "all movies deleted successfully"}
    except Exception as inst:
        return make_response(
            jsonify({"error": f"{inst} occured"}),
            500
        )


@bp.route("/api/movies/<int:id>", methods=["GET"])
def get_movies_id(id):
    try:
        movie = Movie.query.where(Movie.id == id).one()
        return {
            "id": movie.id,
            "title": movie.title,
            "description": movie.description
        }
    except Exception as inst:
        return make_response(
            jsonify({"error": f"{inst}"}),
            404
        )


@bp.route("/api/movies/<int:id>", methods=["PUT"])
def put_movies_id(id):
    if not request.is_json:
        return make_response(
            jsonify({"error": "body must be json"}), 400
        )

    data = request.get_json()
    try:
        movie = Movie.query.filter_by(id=id).one()
        if "title" in data.keys():
            movie.title = data["title"]
        if "description" in data.keys():
            movie.description = data["description"]
        db.session.commit()
        return {
            "message": f"movie {movie.id} updated"
        }
    except NoResultFound:
        return make_response(
            jsonify(error=f"{id} is not present"), 404
        )


@bp.route("/api/movies/<int:id>", methods=["DELETE"])
def delete_movies_id(id):
    try:
        movie = Movie.query.where(Movie.id == id).one()
        db.session.delete(movie)
        db.session.commit()
        return {"message": f"{movie.title} deleted"}
    except Exception as inst:
        return make_response(
            jsonify({"error": f"{inst}"}),
            500
        )

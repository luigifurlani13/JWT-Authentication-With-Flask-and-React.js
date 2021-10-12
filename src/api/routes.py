"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User
from api.utils import generate_sitemap, APIException

api = Blueprint('api', __name__)


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend"
    }

    return jsonify(response_body), 200

@api.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    all_users = list(map(lambda user: user.serialize(), users))
    
    return jsonify(all_users), 200

@api.route('/user/<int:id>', methods=['GET'])
def get_single_user(id):
    single_user = User.query.get(id)
    

    return jsonify(single_user.serialize()), 200

@api.route('/user/active', methods=['POST'])
def get_active_user():
    body = request.get_json()
    print("//////////////////////////////", body)
    single_user = User.query.filter_by(email = body["email"]).first()
    print(single_user)

    return jsonify(single_user.serialize()), 200

@api.route("/login", methods=["POST"])
def login():
    email = request.json.get("email", None)
    password = request.json.get("password", None)
    user = User.query.filter_by(email=email).first()
    if user is None:
        return jsonify({"Message": "Please contact your administrator"}), 401

    if password != user.password:
        return jsonify({"Message": "Please check your credentials"}), 401
        
    access_token = create_access_token(identity=email)
    print(user.first_name)
    return jsonify(access_token=access_token)

@api.route("/user", methods=["POST"])
def create_user():
    body = request.get_json()
    print("/////////////////////", body)
    email = body["email"]
    password = body["password"]
    first_name = body["first_name"]
    last_name = body["last_name"]
    date = body["date"]
    user_exists = User.query.filter_by(email=email).first()
    print("/////////////////////", user_exists)
    if user_exists is not None:
        raise APIException("user already exists", 400)

    user = User(first_name=first_name, 
    last_name=last_name, 
    email=email, 
    password=password, 
    date=date) 
    
    db.session.add(user)
    db.session.commit()

    
    return jsonify(user.serialize()), 201
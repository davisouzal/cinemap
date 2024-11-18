from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from bcrypt import hashpw, gensalt, checkpw

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///cinemap.db'

db = SQLAlchemy(app)
migrate = Migrate(app, db)

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    name = db.Column(db.String(120), nullable=False)
    password = db.Column(db.String(120), nullable=False)

@app.route('/users', methods=['GET'])
def getUsers():
    try:
        users = User.query.all()
        return jsonify([{
            'id': user.id,
            'email': user.email,
            'name': user.name
        } for user in users])
    except:
        return jsonify({'error': 'Erro ao buscar usuários'}), 500

# Adaptação, pois estava usando JWT pra passar o userId, agora passará por params
@app.route('/users/<int:userId>', methods=['GET'])
def getUser(userId):
    try:
        user = User.query.filter_by(id=userId).first()
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        return jsonify({
            'id': user.id,
            'email': user.email,
            'name': user.name
        })
    except:
        return jsonify({'error': 'Erro ao buscar usuário'}), 500


@app.route('/users', methods=['POST'])
def createUser():
    try:
        data = request.json
        data['password'] = hashpw(data['password'].encode('utf-8'), gensalt()).decode('utf-8')
        user = User(email=data['email'], name=data['name'], password=data['password'])
        db.session.add(user)
        db.session.commit()
        return jsonify({'error': False})
    except:
        return jsonify({'error': 'Erro ao criar usuário'}), 500

@app.route('/login', methods=['POST'])
def loginUser():
    try:
        data = request.json
        if not data['email'] or not data['password']:
            return jsonify({'error': 'Email e senha são obrigatórios'}), 400
        
        user = User.query.filter_by(email=data['email']).first()
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        if not checkpw(data['password'].encode('utf-8'), user.password.encode('utf-8')):
            return jsonify({'error': 'Senha incorreta'}), 401

        return jsonify({
            'id': user.id,
            'email': user.email,
            'name': user.name
        })
    except:
        return jsonify({'error': 'Erro ao logar'}), 500


if __name__ == '__main__':
    app.run(debug=True, port=8001)
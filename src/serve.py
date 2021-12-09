from flask import Flask, request, jsonify, send_from_directory
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from .quiz import Quiz

app = Flask(__name__, static_folder='../www')
limiter = Limiter(app, key_func=get_remote_address)

@app.route('/', defaults={'path': ''})
def root(path):
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/language')
@limiter.limit('2/second', error_message='chill, knowledge bomber!')
def language():
    lang = request.args.get('lang')
    if lang:
        return jsonify(Quiz.get_language_names(lang))
    else:
        return jsonify(Quiz.get_languages())

@app.route('/hypernym')
@limiter.limit('1/second', error_message='chill, knowledge bomber!')
def hypernym():
    return jsonify(Quiz.get_hypernyms(request.args.get('ql'),request.args.get('al')))

@app.route('/next', methods=['POST'])
@limiter.limit('2/second, 1000/hour', error_message='chill, knowledge bomber!')
@limiter.limit('9000/day', error_message="It's Over 9000!!")
def next():
    return jsonify(Quiz.next_quiz(request.get_json()))

@app.route('/heartbeat')
def heartbeat():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80, debug=False)

from flask import Flask, request, jsonify, send_from_directory
from quiz import Quiz

app = Flask(__name__, static_folder='app')

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def root(path):
    return send_from_directory('', 'index.html')

@app.route('/language')
def language():
    return jsonify(Quiz.get_languages())

@app.route('/hypernym')
def hypernym():
    return jsonify(Quiz.get_hypernyms(request.args.get('ql'),request.args.get('al')))

@app.route('/next', methods=['POST'])
def next():
    return jsonify(Quiz.next_quiz(request.get_json()))

@app.route('/heartbeat')
def heartbeat():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(host='localhost', port=80)

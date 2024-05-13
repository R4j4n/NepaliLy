from ctypes import util
from flask import Flask,jsonify
from utils import utils
from flask_cors import CORS
app=Flask(__name__)
CORS(app)
app.config['JSON_AS_ASCII'] = False
s=utils.SpellChecker()
pos=utils.POS_Tagging()
trans=utils.Transliterate()
n_w=utils.NextWordPre()

@app.route('/getPOStagging/<string:sen>')
def get_pos_tagging(sen):
    pos_tags=pos.get_POS(sen)
    return jsonify(
        pos_tags
    )

@app.route('/getSuggestion/<string:word>')
def spell_check(word):
    corrected=s.correct_misspelled(word)
    corrected=[word]+corrected #adding the passed word for ignoring the suggestion
    return jsonify(
        {
            'word':word,
            'suggestion':corrected
        }
        
    )
@app.route('/')
def home():
    return "Nepali Text Mate API"

#this endpoint is to check if the passed word is misspelled or not
@app.route('/checkMisspelled/<string:word>')
def check_misspelled(word):
    return jsonify(
        {
            'word':word,
            'is_misspelled': s.is_misspelled(word)
        }
    )

#this endpoint is for transliteration
@app.route('/transliterate/<string:word>')
def perform_transliteration(word):
    return jsonify(
        {
        'word':word,
        'trans_output':trans.transliterate(word)
        }
    )

#this endpoint is for Next Word Prediction
@app.route('/nextWord/<string:word>')
def next_word_prediction(word):
    word=word+" <mask>"
    return jsonify(
        {
            'next_words':n_w.get_all_predictions(word)
        }
    )
    
    
app.run(port=8080)

    
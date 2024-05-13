# importing some useful libraries
import math
import hashlib
import re
from fuzzywuzzy import fuzz
import string

# Fuzzy string matching like a boss. It uses Levenshtein Distance to calculate the differences between sequences
# https://pypi.org/project/fuzzywuzzy/
import torch
import numpy as np
from tensorflow.keras.preprocessing.sequence import pad_sequences
from transformers import BertForMaskedLM
from transformers import BertTokenizer
from scipy.special import softmax


# creating a class for Counting Bloom Filter
# (we can represent all of its attributes)
class CountingBloomFilter:
    # THIS IS FOR SINGLETON DESIGN PATTERN
    __instance = None

    def __new__(cls):
        if cls.__instance is None:
            cls.__instance = super(CountingBloomFilter, cls).__new__(cls)
        return cls.__instance

    # initializing attributes of the CBF class

    def __init__(self, input_size, false_positive_rate):
        # size of the input
        self.input_size = input_size
        # rate for the false positivity
        self.false_positive_rate = false_positive_rate
        # Solving to optimize the size of the array, m
        self.size = int(
            math.ceil(
                (self.input_size * abs(math.log(self.false_positive_rate)))
                / (math.log(2) ** 2)
            )
        )
        # creatiing an array an empty array based on the optimal size
        self.array = [0] * self.size
        # finding the optimal number of hash functions
        self.nr_of_hash_functions = int((self.size / self.input_size) * (math.log(2)))
        if self.nr_of_hash_functions > 4:
            self.nr_of_hash_functions = 4

    def hashing(self, elem):
        """
        *** choosing hash functions ***
        For simple implementation, I used the python library hashlib

        Chosen hash funcitons satisfy the criteria for good hashing:
        1. approximate a uniform distribution so every slot is equally
        likely to be hashed into
        2. They are so fast in computing

        """
        # creating a list where hash values will be stored
        keys = []
        # different types of hash functions
        hash_fun1 = hashlib.md5(elem.encode())
        hash_fun2 = hashlib.sha256(elem.encode())
        hash_fun3 = hashlib.sha1(elem.encode())
        hash_fun4 = hashlib.sha224(elem.encode())
        # inserting the hash values into the list
        keys.append((int(hash_fun1.hexdigest(), 16)))
        keys.append((int(hash_fun2.hexdigest(), 16)))
        keys.append((int(hash_fun3.hexdigest(), 16)))
        keys.append((int(hash_fun4.hexdigest(), 16)))
        return keys

    # Checks if an element is in the database or not
    def look_up(self, element):
        # Holds if the value found or not
        exist = True
        # Find the keys for the elements
        keys = self.hashing(element)
        # Reset the current key
        key = 0
        # Loop through the every key in the list up to the limit
        for indx in range(self.nr_of_hash_functions):
            # Hashing the input
            key = int(keys[indx] % self.size)
            # Check if the element
            if not self.array[key] > 0:
                # Set the value to false
                exist = False
        # Return the result of the function
        return exist

    # this function will insert elements into the array

    def insert(self, elem):
        # print("CREATING THE HASH TABLE :: ")
        # we hash the element which we want to insert
        keys = self.hashing(elem)
        key = 0
        # looping through the hash functions
        for index in range(self.nr_of_hash_functions):
            # determining the key(slot) of the element in the array
            key = int(keys[index] % self.size)
            # increasing the counter of the slot per one
            self.array[key] += 1

    # this function will delete elements from the array
    def delete(self, elem):
        # we hash the element which we want to delete
        keys = self.hashing(elem)
        # if the element exist
        if self.look_up(elem):
            # find its slots
            for index in range(self.nr_of_hash_functions):
                # reduces counters by 1
                key = int(keys[index] % self.size)
                self.array[key] = self.array[key] - 1
        # the element does not exist in the list
        else:
            print("The element does not exist")


class SpellChecker(CountingBloomFilter):
    # THIS IS FOR SINGLETON DESIGN PATTERN
    __instance = None

    def __new__(cls):
        if cls.__instance is None:
            cls.__instance = super(SpellChecker, cls).__new__(cls)
        return cls.__instance

    # initialization method
    def __init__(self):
        # for the lookup dictionary
        sampleFile = open(
            r"utils/final_token_clean_after_rik.txt", "r", encoding="utf-8"
        )
        self.dictionary = sampleFile.read().splitlines()
        sampleFile.close()

        # for the suffix list
        sampleFile = open(r"utils/final_suffix_clean_after.txt", "r", encoding="utf-8")
        self.suffix = sampleFile.read().splitlines()
        sampleFile.close()
        super().__init__(len(self.dictionary), 0.01)
        for i in self.dictionary:
            self.insert(i)

    def is_misspelled(self, word):
        # check if word is not exist in dictionary
        if len(word) == 1:
            return False
        if word in self.suffix:
            return False
        uknown = False
        if not self.look_up(word):
            uknown = True
            res = self.check_suffix(word)
            if self.look_up(res[1]):
                uknown = False
        return uknown

    # this method returns the possible suggestions of the correct words

    def get_suggestions(self, uknown_word):

        # a list to store all the possible suggestions
        suggestions = {}

        # loop over words in the dictionary
        for word in self.dictionary:
            match_percent = fuzz.ratio(uknown_word, word)
            # if the fuzzywuzzy returns the matched value greater than 75
            if match_percent >= 75:
                # append the word to suggestion dict
                suggestions[word] = match_percent

        # return the suggestions
        return suggestions

    def remove_punc_and_special_chars(self, word):
        import re

        normalized_word = re.sub(
            "[\!\@\#\$\%\^\«\»\&\*\(\)\…\[\]\{\}\;\“\”\›\’\‘\"'\:\,\.\‹\/\<\>\?\\\\|\`\´\~\-\=\+\፡\።\፤\;\፦\፥\፧\፨\፠\፣]",
            "",
            word,
        )
        return normalized_word

    # this method returns the corrected string of the given input
    def correct_misspelled(self, text_input):
        words = text_input.split()
        words = [self.remove_punc_and_special_chars(word) for word in words]
        # corrected_words = []

        for word in words:
            suggestionList = []
            # suffix_result=self.check_suffix(word)
            # if self.is_misspelled(word):
            if True:
                suffix_result = self.check_suffix(word)
                suggestion = self.get_suggestions(suffix_result[1])
                sorted_suggestion = sorted(
                    suggestion.items(), key=lambda x: x[1], reverse=True
                )

                for elemnt in sorted_suggestion:
                    suggestionList.append(elemnt[0] + suffix_result[0])

                if len(suggestionList) > 10:
                    suggestionList = suggestionList[:10]
                # print(f"{word} is misspelled and suggestions = {suggestionList} \n")
                return suggestionList
            #       print(f'suggestions for {word}: ',sorted_suggestion)
            #       corrected_words.append(sorted_suggestion)
            else:
                # print(f"{word} is correct.")
                return suggestionList

        # return the cprrected string
        # print(corrected_words
        # return " ".join(corrected_words)

    def check_suffix(self, word):
        has_suffix = ["", word]
        for t_s in self.suffix:
            if re.search(t_s, word) == None:
                continue
            if re.search(t_s, word).string == word:
                has_suffix[0] = t_s
                has_suffix[1] = re.sub(t_s, "", word)
                # print(f"has suffix {t_s}")
                # result=re.sub(t_s,"",word)
                # print(f"after removing suffix {result}")
        return has_suffix


class POS_Tagging:

    # THIS IS FOR SINGLETON DESIGN PATTERN
    __instance = None

    def __new__(cls):
        if cls.__instance is None:
            cls.__instance = super(POS_Tagging, cls).__new__(cls)
        return cls.__instance

    def __init__(self):
        self.max_len = 45
        self.tag2idx = {
            "X": 0,
            "YM": 1,
            "[CLS]": 2,
            "DUM": 3,
            "VBF": 4,
            "RP": 5,
            "VBKO": 6,
            "CS": 7,
            "VBX": 8,
            "VBNE": 9,
            "CC": 10,
            "Unknown": 11,
            "PKO": 12,
            "JJM": 13,
            "PLE": 14,
            "VBO": 15,
            "HRU": 16,
            "YF": 17,
            "NN": 18,
            "YQ": 19,
            "VBI": 20,
            "[SEP]": 21,
            "JJ": 22,
            "POP": 23,
            "PLAI": 24,
            "RBO": 25,
            "PP": 26,
            "CD": 27,
            "NNP": 28,
        }
        self.tag_2_nees = {
            "NN": "Noun",
            "Unknown": "Unknown",
            "X": "Unknown",
            "JJ": "Normal/Unmarked Adjective",
            "NNP": "Noun Plural",
            "POP": "Other Postpositions",
            "PKO": "Ko-Postpositions",
            "YF": "Purnabiram",
            "CD": "Cardinal Digits",
            "PLE": "Postpositions(Le- postpositions)",
            "VBF": "Finite Verb",
            "HRU": "Plural Marker",
            "YM": "Sentence-medial punctuation",
            "VBX": "Auxiliary Verb",
            "VBKO": "Verb aspectual participle",
            "CC": "Coordinating conjunction",
            "DUM": "Pronoun unmarked demonstrative",
            "VBNE": "Verb(Prospective participle)",
            "VBO": "Other participle verb",
            "PLAI": "Postpositions(Lai-Postpositions)",
            "RBO": "Adverb(Other Adverb)",
            "VBI": "Verb Infinitive",
            "YQ": "Quotation Marks",
            "PP": "Possessive pronoun",
            "JJM": "Marked adjective",
            "CS": "Subordinating conjunction appearing before/after the clause it subordinates",
            "RP": "Particle",
        }

        self.tag2name = {self.tag2idx[key]: key for key in self.tag2idx.keys()}
        self.model = BertForMaskedLM.from_pretrained(
            "utils/models/bert_out_model/en09",
            num_labels=len(self.tag2idx),
            output_attentions=False,
            output_hidden_states=False,
        )
        self.vocab_file_dir = "utils/models/bert_out_model/en09"
        self.tokenizer = BertTokenizer.from_pretrained(
            self.vocab_file_dir, strip_accents=False, clean_text=False
        )

    def get_POS(self, test_query):
        tokenized_texts = []
        temp_token = []
        # Add [CLS] at the front
        temp_token.append("[CLS]")
        token_list = self.tokenizer.tokenize(test_query)
        for m, token in enumerate(token_list):
            temp_token.append(token)
        # Trim the token to fit the length requirement
        if len(temp_token) > self.max_len - 1:
            temp_token = temp_token[: self.max_len - 1]
        # Add [SEP] at the end
        temp_token.append("[SEP]")
        tokenized_texts.append(temp_token)
        # Make text token into id
        input_ids = pad_sequences(
            [self.tokenizer.convert_tokens_to_ids(txt) for txt in tokenized_texts],
            maxlen=self.max_len,
            dtype="long",
            truncating="post",
            padding="post",
        )
        # print(input_ids[0])

        # For fine tune of predict, with token mask is 1,pad token is 0
        attention_masks = [[int(i > 0) for i in ii] for ii in input_ids]
        attention_masks[0]
        segment_ids = [[0] * len(input_id) for input_id in input_ids]
        segment_ids[0]
        input_ids = torch.tensor(input_ids)
        attention_masks = torch.tensor(attention_masks)
        segment_ids = torch.tensor(segment_ids)
        # Set save model to Evalue loop
        self.model.eval()
        # Get model predict result
        with torch.no_grad():
            outputs = self.model(
                input_ids,
                token_type_ids=None,
                attention_mask=None,
            )
            # For eval mode, the first result of outputs is logits
            logits = outputs[0]

        # Make logits into numpy type predict result
        # The predict result contain each token's all tags predict result
        predict_results = logits.detach().cpu().numpy()

        predict_results.shape

        result_arrays_soft = softmax(predict_results[0])

        result_array = result_arrays_soft

        # Get each token final predict tag index result
        result_list = np.argmax(result_array, axis=-1)

        x = list()
        y = list()
        new_tokens, new_labels = [], []
        for i, mark in enumerate(attention_masks[0]):
            if mark > 0:
                # print("Token:%s" % (temp_token[i]))
                x.append(temp_token[i])
                #         print("Tag:%s"%(result_list[i]))
                # print("Predict_Tag:%s" % (self.tag2name[result_list[i]]))
                y.append(result_list[i])
                # print("Posibility:%f"%(result_array[i][result_list[i]]))

        for token, label_idx in zip(x, y):
            if token.startswith("##"):
                new_tokens[-1] = new_tokens[-1] + token[2:]
            else:
                new_labels.append(self.tag2name[label_idx])
                new_tokens.append(token)
        tag_names = []
        for i in new_labels[1:-1]:
            tag_names.append(self.tag_2_nees[i])

        pos_result = {}
        for token, label in zip(new_tokens[1:-1], tag_names):
            pos_result[token] = label

        return pos_result


class Transliterate:
    def __init__(self):
        sampleFile = open(r"map/test_map.txt", "r", encoding="utf-8")
        tokens_c = sampleFile.read().splitlines()
        sampleFile.close()
        self.my_map_dict_pure = {}
        for t in tokens_c:
            re = t.split(":")
            if len(re) < 2:
                continue
            self.my_map_dict_pure[re[0]] = re[1]
        sampleFile = open(r"map/test_map_agantuk.txt", "r", encoding="utf-8")
        tokens_c = sampleFile.read().splitlines()
        sampleFile.close()
        self.my_map_dict_add = {}
        for t in tokens_c:
            re = t.split(":")
            if len(re) < 2:
                continue
            self.my_map_dict_add[re[0]] = re[1]
        self.consonants_vowels = {
            "k": "\u0915",  #
            "c": "\u0915",  #
            "kh": "\u0916",  #
            "g": "\u0917",  #
            "gh": "\u0918",  #
            "Ga": "\u0919",
            "ch": "\u091A",  #
            "chh": "\u091B",  #
            "x": "\u091B",  #
            "j": "\u091C",  #
            "z": "\u091C",  #
            "jh": "\u091D",  #
            "ny": "\u091E",  #
            "T": "\u091F",  #
            "Th": "\u0920",  #
            "D": "\u0921",  #
            "Dh": "\u0922",  #
            "N": "\u0923",  #
            "t": "\u0924",  #
            "th": "\u0925",  #
            "d": "\u0926",  #
            "dh": "\u0927",  #
            "n": "\u0928",  #
            "nnn": "\u0929",  #
            "p": "\u092A",  #
            "ph": "\u092B",  #
            "f": "\u092B",  #
            "b": "\u092C",  #
            "bh": "\u092D",  #
            "m": "\u092E",  #
            "y": "\u092F",  #
            "r": "\u0930",  #
            "l": "\u0932",  #
            "w": "\u0935",  #
            "v": "\u0935",  #
            "sh": "\u0936",  #
            "Sa": "\u0937",  #
            "s": "\u0938",  #
            "h": "\u0939",  #
            "ksh": "\u0915" + "\u094D" + "\u0937",  # क्ष
            "tr": "\u0924" + "\u094D" + "\u0930",
            "gy": "\u091C" + "\u094D" + "\u091E",
            # vowels
            "a": "\u0905",  #
            "aa": "\u0906",  #
            "i": "\u0907",  #
            "ii": "\u0908",  #
            "u": "\u0909",  #
            "uu": "\u090A",  #
            "e": "\u090F",  #
            "ai": "\u0910",  #
            "o": "\u0913",  #
            "au": "\u0914",  #
            "am": "\u0905" + "\u0902",  # अं  #still not fixed
            # numbers and purnabiram
            "0": "\u0966",  #
            "1": "\u0967",  #
            "2": "\u0968",  #
            "3": "\u0969",  #
            "4": "\u096A",  #
            "5": "\u096B",  #
            "6": "\u096C",  #
            "7": "\u096D",  #
            "8": "\u096E",  #
            "9": "\u096F",  #
            "|": "\u0964",  #
        }

        self.matras = {
            "aa": "\u093E",  # ा
            "i": "\u093F",  # ि
            "ee": "\u093F",
            "ii": "\u0940",  # ी
            "u": "\u0941",
            "uu": "\u0942",
            "oo": "\u0942",
            "r": "\u0943",
            "rr": "\u0944",
            "e": "\u0947",
            "ai": "\u0948",
            "o": "\u094B",
            "au": "\u094C",
            "ain": "\u0948" + "\u0902",
            # 'aun':u'\u094C' + u'\u0902',
            "oon": "\u0942" + "\u0901",
            "ein": "\u0947" + "\u0902",
            "**": "\u0901",  # chandrabindu
            "*": "\u0902",  # anusvara
            ":": "\u0903",  # bisarga
        }

    def check_matras(self, buf, word):
        global i
        # #this is to fix hamro problem
        # backup_i=i
        # if word[i]=='r':
        #     i=i+1
        #     res=self.check_matras(buf,word)
        #     print(f"hamro -----{res}, buff-----{buf}")
        #     if res!='' and res!="no_matras":
        #         return u'\u094D'+u'\u0930'+res
        # else:
        #     i=backup_i
        len_word = len(word)  # len_word=6
        temp_buf = ""

        if i == len_word:
            return temp_buf

        if len_word - i >= 3:
            token = word[i : i + 3]  # ike
        else:
            token = word[i:]
        while token:
            if token in self.matras:
                i = i + len(token)  # i=2
                # if (token == 'i' and i == len_word):
                #     # adding ी at last if i comes at last raso ikar matra aauni problem solve garna
                #     temp_buf = buf + u'\u0940'
                #     break
                temp_buf = buf + self.matras[token]
                # print(f"inside check_matras{temp_buf}")
                break
            else:
                token = token[:-1]
        if temp_buf == "":
            if word[i] == "a":
                i = i + 1
                temp_buf = "no_matras"
        return temp_buf

    def transliterate(self, word):
        if word in self.consonants_vowels:
            return self.consonants_vowels[word]
        # this is to handle 'a' issue:
        if word[-1] == "a" and word[:-1] in self.consonants_vowels:
            if word != "aa":
                return self.consonants_vowels[word[:-1]]
        if word in self.my_map_dict_pure:
            return self.my_map_dict_pure[word]
        if word in self.my_map_dict_add:
            return self.my_map_dict_add[word]
        last_dot = False
        if word[-1] == ".":
            word = word[:-1]
            last_dot = True

        global i
        trans = ""
        if len(word) < 1:  # add the words having the length less than 1 with out trans
            trans = trans + word
        else:
            i = 0
            buf = ""
            len_word = len(word)
            token = "s"

            while (
                i < len_word and token
            ):  # 3 3 ota char li 3 bhanda thorai char bhayama sabai li,
                if len_word - i >= 3:
                    token = word[i : i + 3]
                else:
                    token = word[i:]
                while token:  # loop till we get a token
                    if token in self.consonants_vowels:
                        i = i + len(token)  # i=1

                        # this is to check the vowels to avoid matra checking
                        if (
                            token == "a"
                            or token == "aa"
                            or token == "i"
                            or token == "ii"
                            or token == "u"
                            or token == "uu"
                            or token == "e"
                            or token == "ai"
                            or token == "o"
                            or token == "au"
                            or token == "am"
                        ):
                            buf = buf + self.consonants_vowels[token]
                            break

                        temp = self.check_matras(self.consonants_vowels[token], word)

                        if temp == "no_matras":
                            if len_word == i:  # last ma a aayama aakar dine
                                buf = buf + self.consonants_vowels[token] + "\u093E"
                            else:
                                buf = buf + self.consonants_vowels[token]

                        elif temp == "":
                            if len_word != i:  # adding aada if not last
                                buf = buf + self.consonants_vowels[token] + "\u094D"
                            else:
                                buf = buf + self.consonants_vowels[token]
                        else:
                            buf = buf + temp
                        break
                    else:
                        token = token[:-1]
            trans = trans + buf
        if last_dot:
            trans = trans + " " + "\u0964"
        return trans

    # print("rukesh")
    # my_in=transliterate("rukesh")
    # print(my_in)


class NextWordPre:
    def __init__(self):
        self.vocab_file_dir = "utils/models/NepaliBERT/"
        self.bert_tokenizer = BertTokenizer.from_pretrained(
            self.vocab_file_dir, strip_accents=False, clean_text=False
        )

        self.bert_model = BertForMaskedLM.from_pretrained(
            "utils/models/NepaliBERT/"
        ).eval()
        self.top_k = 10

    def decode(self, tokenizer, pred_idx, top_clean):
        ignore_tokens = string.punctuation + "[PAD]"
        tokens = []
        for w in pred_idx:
            token = "".join(tokenizer.decode(w).split())
            if token not in ignore_tokens:
                tokens.append(token.replace("##", ""))
        return " ".join(tokens[:top_clean])

    def encode(self, tokenizer, text_sentence, add_special_tokens=True):
        text_sentence = text_sentence.replace("<mask>", tokenizer.mask_token)
        # if <mask> is the last token, append a "." so that models dont predict punctuation.
        if tokenizer.mask_token == text_sentence.split()[-1]:
            text_sentence += " ."

        input_ids = torch.tensor(
            [tokenizer.encode(text_sentence, add_special_tokens=add_special_tokens)]
        )
        mask_idx = torch.where(input_ids == tokenizer.mask_token_id)[1].tolist()[0]
        return input_ids, mask_idx

    def get_all_predictions(self, text_sentence, top_clean=5):
        # ========================= BERT =================================
        # print(text_sentence)
        input_ids, mask_idx = self.encode(self.bert_tokenizer, text_sentence)
        with torch.no_grad():
            predict = self.bert_model(input_ids)[0]
        bert = self.decode(
            self.bert_tokenizer,
            predict[0, mask_idx, :].topk(self.top_k).indices.tolist(),
            top_clean,
        )
        bert = bert.split(" ")

        return bert

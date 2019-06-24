##############################################
#  IMPORT STATEMENTS
##############################################

# == Native ==
import os
import sys
import json
import copy
from typing import Dict, List, Any, Tuple, Hashable, Iterable, Union
from collections import defaultdict



##############################################
# FUNCTIONS FOR FINDING THE ERRORS
##############################################


def agreement_classification(listOfClassifications):
    """
    computes, whether there is diagreement, the most likely prediction and confidences of each.
    """
    countDict = { "counts" : defaultdict(float), "predictions" : set()}
    counter = 0

    errorFlag = False

    for prediction in listOfClassifications:

        counter += 1

        for label in prediction:

            countDict["counts"][label] += 1

    if counter > 0:

        for key,value in countDict["counts"].items():

            temp = value/counter

            countDict["counts"][key] = temp

            if temp<1:

                errorFlag = True

    if errorFlag:
        for key,value in countDict["counts"].items():

            if value>=0.5:

                countDict["predictions"].add(key)

        countDict["predictions"] = list( countDict["predictions"] )
        return countDict

    else:
        return {}





def agreement_classification_string(listOfClassificationStrings):
    """
    computes, whether there is diagreement, the most likely prediction and confidences of each.
    """
    countDict = { "counts" : defaultdict(float), "predictions" : set()}

    valueDict = {}

    counter = 0

    errorFlag = False

    for prediction in listOfClassificationStrings:

        counter += 1

        for label in prediction:

            countDict["counts"][label[0]] += 1

            temp = valueDict.get(label[0])

            if temp:
                if not (temp==label[1]):
                    errorFlag = True
            else:
                valueDict[label[0]] = label[1]

    if counter > 0:

        for key,value in countDict["counts"].items():

            temp = value/counter

            countDict["counts"][key] = temp

            if temp<1:

                errorFlag = True


    if errorFlag:
        for key,value in countDict["counts"].items():

            if value>=0.5:

                countDict["predictions"].add(key)

        countDict["predictions"] = [ (x,y) for x in countDict["predictions"] for z,y in valueDict.items() if z==x]

        return countDict

    else:
        return {}







agreementConfig = {
    "data" : None,
    "string" : None,
    "multilabel_classification" : agreement_classification,
    "multilabel_classification_string" : agreement_classification_string
}

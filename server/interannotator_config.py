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






##############################################
# FUNCTIONS FOR CALCULATING THE SCORES
##############################################

def agreement_classification_score(listOfClassifications, totalLabels):
    """
    computes, whether there is diagreement, the most likely prediction and confidences of each.
    """
    countDict = { "counts" : defaultdict(float), "total" : 0 , "errors":0, "annotatedBy" : 0, "alpha" : 0.0 , "kappa" : 0.0, "accuracy" : 0 }
    counter = 0

    #getting raw counts
    for prediction in listOfClassifications:

        counter += 1

        for label in prediction:

            countDict["counts"][label] += 1

    countDict["annotatedBy"] = counter

    #getting error, `alpha` and `kappa` -> slightly modified version of Fleiss Kappa & Krippendorff Alpha
    errorCount = 0
    totalLabel = 0
    for label, count in countDict["counts"].items():

        totalLabel += 1

        if counter > count:

            errorCount += 1

    countDict["errors"] = errorCount
    countDict["total"] = totalLabel


    #kappa is calculated with uniform random probabilty for the chance
    A0 = (1 / (totalLabels * totalLabels ) )
    Ae = errorCount / totalLabels
    countDict["kappa"] = (Ae-A0) / (1-A0)


    #A02
    countDict["accuracy"] = errorCount/totalLabels

    return countDict






##############################################
# API to the outside world
##############################################

agreementConfig = {
    "data" : None,
    "string" : None,
    "multilabel_classification" : agreement_classification,
    "multilabel_classification_string" : agreement_classification_string
}

agreementScoreConfig = {
    "data" : None,
    "string" : None,
    "multilabel_classification" : agreement_classification_score,
    "multilabel_classification_string" : None
}





# EOF

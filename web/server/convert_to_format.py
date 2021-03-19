
class ConversionScripts:
    def convert_document_to_format(document,Configuration,annotationStyle):     
        if (type(document)) == list:
            rebuiltDocument = {}
            for document in document:
                for dialogueName, dialogue in document.items():
                    dialogue = ConversionScripts.convert_dialogue_to_format(dialogue)
                    validation = Configuration.validate_dialogue(annotationStyle, dialogue) 
                    if ((type(validation) is str) and (validation.startswith("ERROR"))):
                        print("Validation for",dialogueName," failed with "+annotationStyle)
                        #response = {"status":"error","error":" Dialogue "+dialogueName+": "+str(validation)} 
                        #return jsonify( response )
                        rebuiltDocument[dialogueName] = dialogue
            return rebuiltDocument

    def convert_dialogue_to_format(dialogue):
        turnList = []
        metaTags = {}
        turnList.append(metaTags)
        for element in dialogue:
            if ((element == "log") and (type(dialogue[element]) == list)):
                for turn in dialogue[element]:
                    turnList.append(turn)
            else:
                turnList[0][element] = dialogue[element]
        return turnList
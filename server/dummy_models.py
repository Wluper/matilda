########################################
#          DUMMY Models
#
#   We distribute dummy classes that emulate the models and recommenders of the annotation app.
#   Models need only implement a transfrom method, that takes a string (the sentence) as input.
#
#   Conclusion:
#        Models need a transform method
########################################


class SysDummyModel:
    """
        Emulates the system response
    """

    def transform(self, sent):
        return "I am a mock model response"



class BeliefStateDummyModel:
    """
        Emulates the BeliefStateTracker

            "labels": [
                "hotel-book people",
                "hotel-book stay",
                "hotel-book day",
                "hotel-name"
            ]
    """

    def transform(self, sent):
        return [("hotel-book people", "5")]


class PolicyDummyModel:
    """
        Emulates a Policy Predictor

            "labels": [
                'Say Goodbye',
                'Find And Offer Booking',
                'Ask For Missing Slots',
                'Provide Info',
                'Try Book'
            ]
    """

    def transform(self, sent):
        return ["Find And Offer Booking", "Ask For Missing Slots"]


class TypeDummyModel:
    """
        Emulates the BeliefStateTracker

            "labels": [
                "request",
                "inform",
                "farewell"
            ]
    """
    def transform(self, sent):
        return ["request"]

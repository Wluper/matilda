![WLUPER AND UNIPI](images/research_collaboration_matilda.png)   

# MATILDA: Multi-AnnoTator multi-language Interactive Lightweight Dialogue Annotator

**Authors:** Davide Cucurnia, Nikolai Rozanov, Irene Sucameli, Augusto Ciuffoletti, Maria Simi

**Contact:** contact@wluper.com

**Paper:** [link to the EACL paper](https://www.aclweb.org/anthology/2021.eacl-demos.5/)

### Citation at bottom of README! (Please cite when using)

## 1.5

- Configuration view in Admin Panel
- Supervision annotation rate bars
- Supervision view now allows to upload an already annotated dialogue collection
- Supervision view now allows to edit turn utterances of collections
- Inter-annotator stats for multilabel-string-classification
- Annotation Rate for single dialogue is calculated anew when entering dialogue annotation mode

## 1.4

- Dialogue annotation view displays few annotation customizable options: 
  - Resizable layout, useful for very large or very small screen layouts. 
  - Character limit for turn utterances with scroll-bar.
  - Auto-save on turn change.


## Citation
Please cite these two papers when using.
```
@inproceedings{cucurnia-etal-2021-matilda,
    title = "{MATILDA} - Multi-{A}nno{T}ator multi-language {I}nteractive{L}ight-weight Dialogue Annotator",
    author = "Cucurnia, Davide  and
      Rozanov, Nikolai  and
      Sucameli, Irene  and
      Ciuffoletti, Augusto  and
      Simi, Maria",
    booktitle = "Proceedings of the 16th Conference of the European Chapter of the Association for Computational Linguistics: System Demonstrations",
    month = apr,
    year = "2021",
    address = "Online",
    publisher = "Association for Computational Linguistics",
    url = "https://www.aclweb.org/anthology/2021.eacl-demos.5",
    pages = "32--39",
    abstract = "Dialogue Systems are becoming ubiquitous in various forms and shapes - virtual assistants(Siri, Alexa, etc.), chat-bots, customer sup-port, chit-chat systems just to name a few.The advances in language models and their publication have democratised advanced NLP.However, data remains a crucial bottleneck.Our contribution to this essential pillar isMATILDA, to the best of our knowledge the first multi-annotator, multi-language dialogue annotation tool. MATILDA allows the creation of corpora, the management of users, the annotation of dialogues, the quick adaptation of the user interface to any language and the resolution of inter-annotator disagreement. We evaluate the tool on ease of use, annotation speed and interannotation resolution for both experts and novices and conclude that this tool not only supports the full pipeline for dialogue annotation, but also allows non-technical people to easily use it. We are completely open-sourcing the tool at https://github.com/wluper/matilda and provide a tutorial video1.",
}
```

```
@inproceedings{collins-etal-2019-lida,
    title = "{LIDA}: Lightweight Interactive Dialogue Annotator",
    author = "Collins, Edward  and
      Rozanov, Nikolai  and
      Zhang, Bingbing",
    booktitle = "Proceedings of the 2019 Conference on Empirical Methods in Natural Language Processing and the 9th International Joint Conference on Natural Language Processing (EMNLP-IJCNLP): System Demonstrations",
    month = nov,
    year = "2019",
    address = "Hong Kong, China",
    publisher = "Association for Computational Linguistics",
    url = "https://www.aclweb.org/anthology/D19-3021",
    doi = "10.18653/v1/D19-3021",
    pages = "121--126",
    abstract = "Dialogue systems have the potential to change how people interact with machines but are highly dependent on the quality of the data used to train them.It is therefore important to develop good dialogue annotation tools which can improve the speed and quality of dialogue data annotation. With this in mind, we introduce LIDA, an annotation tool designed specifically for conversation data. As far as we know, LIDA is the first dialogue annotation system that handles the entire dialogue annotation pipeline from raw text, as may be the output of transcription services, to structured conversation data. Furthermore it supports the integration of arbitrary machine learning mod-els as annotation recommenders and also has a dedicated interface to resolve inter-annotator disagreements such as after crowdsourcing an-notations for a dataset. LIDA is fully open source, documented and publicly available.[https://github.com/Wluper/lida] {--}{\textgreater} Screen Cast: https://vimeo.com/329824847",
}
```

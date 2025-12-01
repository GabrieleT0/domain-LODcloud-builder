import datetime
import re
from SPARQLWrapper import *
from SPARQLWrapper import SPARQLWrapper
from xml.dom.minidom import Document
import time
import utils
import warnings
import xml.etree.ElementTree as ET
import rdflib
from urllib.parse import quote

def log_in_out(func):

    def decorated_func(*args, **kwargs):
        print("Doing ", func.__name__)
        result = func(*args, **kwargs)
        print("Done ")
        return result

    return decorated_func

def checkLicenseMR(url): #PROBLEM ON http://lod.b3kat.de/sparql
    sparql = SPARQLWrapper(url)
    sparql.setQuery('''
    PREFIX cc: <http://creativecommons.org/ns#>
    PREFIX dc: <http://purl.org/dc/elements/1.1/>
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX schema: <http://schema.org/>
    PREFIX doap: <http://usefulinc.com/ns/doap#>
    PREFIX xhtml: <http://www.w3.org/1999/xhtml#>
    SELECT DISTINCT ?o
    WHERE{
    {?s ?p ?o}
    VALUES (?p) {(dct:license) (dct:rights) (cc:license) (dc:license) (schema:license) (doap:license) (xhtml:license) (dc:rights)}
    }
    LIMIT 1
    ''')
    try:
        sparql.setTimeout(300)
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()
        if isinstance(results,dict):
            licenses = utils.getResultsFromJSON(results)
            return licenses
        elif isinstance(results,Document):
            licenses = utils.getResultsFromXML(results)
            return licenses
        else:
            return False
    except Exception as e:
        return False

def check_if_up(url):
    sparql = SPARQLWrapper(url)
    sparql.setQuery("""
        SELECT ?s ?p ?o
        WHERE { ?s ?p ?o }
        LIMIT 1
    """)
    sparql.setTimeout(300)  # 5 minutes

    try:
        # Try JSON first
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()

        if "results" in results and "bindings" in results["results"]:
            bindings = results["results"]["bindings"]
            if len(bindings) > 0:
                return True
            else:
                return False
    except Exception as e_json:
        try:
            sparql.setReturnFormat(XML)
            xml_data = sparql.query().convert()
            root = ET.fromstring(xml_data)
            results = root.findall(".//{http://www.w3.org/2005/sparql-results#}result")

            if len(results) > 0:
                return True
            else:
                return False
        except Exception as e_xml:
            return False

@log_in_out
def get_all_metadata_obj(endpoint_url):
    sparql = SPARQLWrapper(endpoint_url)
    query = """
        PREFIX void: <http://rdfs.org/ns/void#>
        PREFIX foaf: <http://xmlns.com/foaf/0.1/>
        PREFIX dcat: <http://www.w3.org/ns/dcat#>

        SELECT DISTINCT ?o
        WHERE {
        {
            ?dataset a void:Dataset ;
                   ?p ?o .
        }
        UNION
        {
            ?dataset a dcat:Dataset ;
                    ?p ?o .
        }
        }
        """
    try:
        sparql.setQuery(query)
        sparql.setTimeout(300)
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()
        if isinstance(results,dict):
            triples = utils.getResultsFromJSON(results)
            return triples
        elif isinstance(results,Document):
            triples = utils.getResultsFromXML(results)
            return triples
        else:
            return False
    except:
        return False

@log_in_out
def get_version(endpoint_url):
    sparql = SPARQLWrapper(endpoint_url)
    query = """
    PREFIX void: <http://rdfs.org/ns/void#>
    PREFIX dcat: <http://www.w3.org/ns/dcat#>
    PREFIX schema: <https://schema.org/>
    PREFIX dcterms: <http://purl.org/dc/terms/>

    SELECT DISTINCT ?o
    WHERE {
    {
        ?dataset a void:Dataset ;
                dcat:hasVersion ?o .
    }
    UNION
    {
        ?dataset a dcat:Dataset ;
                dcat:hasVersion ?o .
    }
    UNION
    {
        ?dataset a void:Dataset ;
                dcterms:hasVersion ?o .
    }
    UNION
    {
        ?dataset a dcat:Dataset ;
                dcterms:hasVersion ?o .
    }
    }
    LIMIT 1
    """
    try:
        sparql.setQuery(query)
        sparql.setTimeout(300)
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()
        if isinstance(results,dict):
            triples = utils.getResultsFromJSON(results)
            return triples
        elif isinstance(results,Document):
            triples = utils.getResultsFromXML(results)
            return triples
        else:
            return False
    except:
        return False
    
@log_in_out
def check_acc_feature(endpoint_url):
    sparql = SPARQLWrapper(endpoint_url)
    query = """
        PREFIX schema: <https://schema.org/>

        SELECT ?o
        WHERE {
        ?s schema:accessibilityFeature ?o .
        }
    """
    try:
        sparql.setQuery(query)
        sparql.setTimeout(300)
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()
        if isinstance(results,dict):
            triples = utils.getResultsFromJSON(results)
            return triples
        elif isinstance(results,Document):
            triples = utils.getResultsFromXML(results)
            return triples
        else:
            return False
    except:
        return False

@log_in_out
def get_identifier(endpoint_url):
    sparql = SPARQLWrapper(endpoint_url)
    query = """
    PREFIX void: <http://rdfs.org/ns/void#>
    PREFIX dcat: <http://www.w3.org/ns/dcat#>
    PREFIX schema: <https://schema.org/>
    PREFIX dcterms: <http://purl.org/dc/terms/>

    SELECT DISTINCT ?o
    WHERE {
        ?dataset a ?type ;
                ?p ?o .
        VALUES ?type { void:Dataset dcat:Dataset }
        VALUES ?p { dcterms:bibliographicCitation dcterms:identifier schema:identifier }
    }
    LIMIT 1
    """
    try:
        sparql.setQuery(query)
        sparql.setTimeout(300)
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()
        if isinstance(results,dict):
            triples = utils.getResultsFromJSON(results)
            return triples
        elif isinstance(results,Document):
            triples = utils.getResultsFromXML(results)
            return triples
        else:
            return False
    except:
        return False

@log_in_out
def get_contact_point(endpoint_url):
    sparql = SPARQLWrapper(endpoint_url)
    query = """
    PREFIX void: <http://rdfs.org/ns/void#>
    PREFIX dcat: <http://www.w3.org/ns/dcat#>
    PREFIX dcterms: <http://purl.org/dc/terms/>

    SELECT DISTINCT ?o
    WHERE {
        ?dataset a ?type ;
                ?p ?o .
        VALUES ?type { void:Dataset dcat:Dataset }
        VALUES ?p { dcat:contactPoint }
    }
    LIMIT 1
    """
    try:
        sparql.setQuery(query)
        sparql.setTimeout(300)
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()
        if isinstance(results,dict):
            triples = utils.getResultsFromJSON(results)
            return triples
        elif isinstance(results,Document):
            triples = utils.getResultsFromXML(results)
            return triples
        else:
            return False
    except:
        return False    

@log_in_out
def get_download_link(url):
    sparql = SPARQLWrapper(url)
    sparql.setQuery('''
       PREFIX dcterms: <http://purl.org/dc/terms/>
        PREFIX dcat: <http://www.w3.org/ns/dcat#>
        PREFIX void: <http://rdfs.org/ns/void#>

        SELECT ?o
        WHERE {
        VALUES ?type { dcat:Dataset dcat:Distribution void:Dataset }
        VALUES ?prop {  void:dataDump dcat:downloadURL }
        ?dataset a ?type ;
                ?prop ?o .
        }''')
    sparql.setTimeout(300)
    sparql.setReturnFormat(JSON)
    try:
        results = sparql.query().convert()
        if isinstance(results,dict):
            urls = utils.getResultsFromJSON(results)
            return urls
        elif isinstance(results,Document):
            urls = utils.getResultsFromXML(results)
            return urls
        else:
            return False
    except Exception:
        return False

@log_in_out
def getImageIri(endpoint_url):
    sparql = SPARQLWrapper(endpoint_url)
    sparql.setQuery('''
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    PREFIX schema: <http://schema.org/>
    PREFIX dbo: <http://dbpedia.org/ontology/>
    PREFIX wdt: <http://www.wikidata.org/prop/direct/>
    PREFIX dcterms: <http://purl.org/dc/terms/>
    PREFIX sioc: <http://rdfs.org/sioc/ns#>
    PREFIX exif: <http://www.w3.org/2003/12/exif/ns#>
    PREFIX dcmitype: <http://purl.org/dc/dcmitype/>

    SELECT DISTINCT ?o
    WHERE {
    VALUES ?prop {
        foaf:depiction dcterms:thumbnail foaf:img foaf:thumbnail schema:image schema:photo 
        schema:logo schema:thumbnail schema:thumbnailUrl foaf:image schema:contentUrl 
        dbo:thumbnail dbo:image sioc:avatar wdt:P18 <http://example.org/hasImage> exif:image dcmitype:Image
    }
    ?resource ?prop ?o .
    }''')
    try:
        sparql.setTimeout(300)
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()
        if isinstance(results,dict):
            value = utils.getResultsFromJSON(results)
            return value
        elif isinstance(results,Document):
            value = utils.getResultsFromXML(results)
            return value
        else:
            return False
    except Exception as e:
        return False

@log_in_out
def fetch_subjects(endpoint_url, limit=1000, condition = ()):
    sparql = SPARQLWrapper(endpoint_url)
    offset = 0
    count = 0

    while True:
        query = f"""
        SELECT DISTINCT ?s
        WHERE {{
            ?s ?p ?s .
            FILTER(isIRI(?s))
        }}
        ORDER BY ?s
        LIMIT {limit}
        OFFSET {offset}
        """
        try:
            sparql.setQuery(query)
            sparql.setReturnFormat(JSON)
            results = sparql.query().convert()
            bindings = results.get("results", {}).get("bindings", [])

            if not bindings:
                break  # no more results

            for result in bindings:
                o = result["s"]["value"].lower()
                if len(condition) > 0 and o.endswith(condition):
                    count += 1
                elif len(condition) == 0:
                    count += 1
            offset += limit
        except Exception as e:
            return count
    return count

@log_in_out
def count_res_with_label(endpoint_url):
    sparql = SPARQLWrapper(endpoint_url)
    sparql.setQuery('''
        PREFIX skosxl: <http://www.w3.org/2008/05/skos-xl#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
        PREFIX dcterms: <http://purl.org/dc/terms/>
        PREFIX foaf: <http://xmlns.com/foaf/0.1/>
        PREFIX awol: <http://bblfish.net/work/atom-owl/2006-06-06/#>
        PREFIX wdrs: <http://www.w3.org/2007/05/powder-s#>
        PREFIX schema: <http://schema.org/>

        SELECT (COUNT(DISTINCT ?s) AS ?triples)
        WHERE {
        { ?s rdfs:label ?o }
        UNION { ?s foaf:name ?o }
        UNION { ?s skos:prefLabel ?o }
        UNION { ?s dcterms:title ?o }
        UNION { ?s dcterms:description ?o }
        UNION { ?s rdfs:comment ?o }
        UNION { ?s awol:label ?o }
        UNION { ?s dcterms:alternative ?o }
        UNION { ?s skos:altLabel ?o }
        UNION { ?s skos:note ?o }
        UNION { ?s wdrs:text ?o }
        UNION { ?s skosxl:altLabel ?o }
        UNION { ?s skosxl:hiddenLabel ?o }
        UNION { ?s skosxl:prefLabel ?o }
        UNION { ?s skosxl:literalForm ?o }
        UNION { ?s schema:name ?o }
        UNION { ?s schema:description ?o }
        UNION { ?s schema:alternateName ?o }
        }

    ''')
    try:
        sparql.setTimeout(300)
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()
        if isinstance(results,dict):
            value = utils.getResultsFromJSONCountInt(results)
            return value
        elif isinstance(results,Document):
            value = utils.getResultsFromXMLCount(results)
            return value
        else:
            return False
    except Exception as e:
        print(e)
        return False

@log_in_out
def count_res(endpoint_url):
    sparql = SPARQLWrapper(endpoint_url)
    sparql.setQuery('''
        SELECT (COUNT(DISTINCT ?s) AS ?triples)
        WHERE {
        ?s ?p ?o .
        }''')
    try:
        sparql.setTimeout(300)
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()
        if isinstance(results,dict):
            value = utils.getResultsFromJSONCountInt(results)
            return value
        elif isinstance(results,Document):
            value = utils.getResultsFromXMLCount(results)
            return value
        else:
            return False
    except Exception as e:
        print(e)
        return False

@log_in_out
def get_examples(endpoint_url):
    sparql = SPARQLWrapper(endpoint_url)
    query = """
    PREFIX void: <http://rdfs.org/ns/void#>
    PREFIX dcat: <http://www.w3.org/ns/dcat#>
    PREFIX dcterms: <http://purl.org/dc/terms/>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    PREFIX schema: <https://schema.org/>

    SELECT DISTINCT ?o
    WHERE {
            ?dataset a void:Dataset ;
                    void:exampleResource ?o .
    } """
    try:
        sparql.setQuery(query)
        sparql.setTimeout(300)
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()
        if isinstance(results,dict):
            triples = utils.getResultsFromJSON(results)
            return triples
        elif isinstance(results,Document):
            triples = utils.getResultsFromXML(results)
            return triples
        else:
            return False
    except:
        return False
   
@log_in_out
def getDescription(endpoint_url):
    sparql = SPARQLWrapper(endpoint_url)
    query = """
    PREFIX void: <http://rdfs.org/ns/void#>
    PREFIX dcat: <http://www.w3.org/ns/dcat#>
    PREFIX dcterms: <http://purl.org/dc/terms/>

    SELECT DISTINCT ?o
    WHERE {
        ?dataset a ?type ;
                ?p ?o .
        VALUES ?type { void:Dataset dcat:Dataset dcat:Distribution }
        VALUES ?p { dcterms:description }
    }
    """
    try:
        sparql.setQuery(query)
        sparql.setTimeout(300)
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()
        if isinstance(results,dict):
            triples = utils.getResultsFromJSON(results)
            return triples
        elif isinstance(results,Document):
            triples = utils.getResultsFromXML(results)
            return triples
        else:
            return False
    except Exception as e:
        return e
 
@log_in_out
def getLangugeSupported(url):
    languages = []
    sparql = SPARQLWrapper(url)
    sparql.setQuery("""
    SELECT DISTINCT ?triples 
    WHERE{
    ?s ?p ?o.
    BIND(LANG(?o) as ?triples)}
    """)
    sparql.setReturnFormat(JSON)
    sparql.setTimeout(300) #5 minutes
    try:
        results = sparql.query().convert()
        if isinstance(results,dict):
            languages = utils.getResultsFromJSONCount(results)
            return languages
        elif isinstance(results,Document): #IF RESULT IS IN XML 
            languages = utils.getResultsFromXML(results)
            return languages
        else:
            return False
    except Exception as e:
        return False

@log_in_out
def get_string_literals(endpoint_url):
    sparql = SPARQLWrapper(endpoint_url)
    # We have to recover it like this because the string with the language tag is not recognized as a string with datatype xsd:string
    #?lang is empty if no lang tag is present or is xsd:string
    query = """
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    SELECT ?o (lang(?o) AS ?lang)
    WHERE { 
        ?s ?p ?o .
        FILTER ( isLiteral(?o) && (datatype(?o) = xsd:string || lang(?o) != "") )
    }
                
    """
    try:
        sparql = SPARQLWrapper(endpoint_url)
        sparql.setQuery(query)
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()

        # Store triples in list as (object, lang)
        triples_list = []
        for result in results["results"]["bindings"]:
            obj = result["o"]["value"]
            lang = result.get("lang", {}).get("value", "")
            triples_list.append((obj, lang))

        # Count totals
        total_count = len(triples_list)
        lang_filtered_count = sum(1 for _, lang in triples_list if lang and lang != "xsd:string")

        return total_count, lang_filtered_count
    except Exception as e:
        return False

def get_metadata_languages(endpoint_url):
    sparql = SPARQLWrapper(endpoint_url)
    sparql.setQuery('''
    PREFIX void: <http://rdfs.org/ns/void#>
    PREFIX dcat: <http://www.w3.org/ns/dcat#>
    PREFIX dcterms: <http://purl.org/dc/terms/>

    SELECT DISTINCT ?o
    WHERE {
        ?dataset a ?type ;
                ?p ?o .
        VALUES ?type { void:Dataset dcat:Dataset dcat:Distribution }
        VALUES ?p { dcterms:language schema:inLanguage }
    }''')
    sparql.setReturnFormat(JSON)
    sparql.setTimeout(300)
    try:
        results = sparql.query().convert()
        if isinstance(results,dict):
            triples = utils.getResultsFromJSON(results)
            return triples
        elif isinstance(results,Document):
            triples = utils.getResultsFromXML(results)
            return triples
        else:
            return False
    except Exception as e:
        return e

@log_in_out
def getImageIri(endpoint_url):
    sparql = SPARQLWrapper(endpoint_url)
    sparql.setQuery('''
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    PREFIX schema: <http://schema.org/>
    PREFIX dbo: <http://dbpedia.org/ontology/>
    PREFIX wdt: <http://www.wikidata.org/prop/direct/>
    PREFIX dcterms: <http://purl.org/dc/terms/>
    PREFIX sioc: <http://rdfs.org/sioc/ns#>
    PREFIX exif: <http://www.w3.org/2003/12/exif/ns#>
    PREFIX dcmitype: <http://purl.org/dc/dcmitype/>

    SELECT DISTINCT ?o
    WHERE {
    VALUES ?prop {
        foaf:depiction dcterms:thumbnail foaf:img foaf:thumbnail schema:image schema:photo 
        schema:logo schema:thumbnail schema:thumbnailUrl foaf:image schema:contentUrl 
        dbo:thumbnail dbo:image sioc:avatar wdt:P18 <http://example.org/hasImage> exif:image dcmitype:Image
    }
    ?resource ?prop ?o .
    }''')
    try:
        sparql.setTimeout(300)
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()
        if isinstance(results,dict):
            value = utils.getResultsFromJSON(results)
            return value
        elif isinstance(results,Document):
            value = utils.getResultsFromXML(results)
            return value
        else:
            return False
    except Exception as e:
        return False

@log_in_out
def hasAltDescription(endpoint_url,iri_to_check):
    sparql = SPARQLWrapper(endpoint_url)
    encoded_iri = quote(iri_to_check, safe="/:#?&=%")
    sparql.setQuery(f"""
    PREFIX skosxl: <http://www.w3.org/2008/05/skos-xl#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX dcterms: <http://purl.org/dc/terms/>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    PREFIX awol: <http://bblfish.net/work/atom-owl/2006-06-06/#>
    PREFIX wdrs: <http://www.w3.org/2007/05/powder-s#>
    PREFIX schema: <http://schema.org/>
    SELECT ?o
    WHERE {{
        VALUES ?prop {{ rdfs:label foaf:name schema:alternateName dcterms:description skos:prefLabel dcterms:alternative skos:altLabel dcterms:title
                     rdfs:comment awol:label dcterms:alternative skos:altLabel skos:note wdrs:text skosxl:altLabel skosxl:hiddenLabel skosxl:prefLabel
                     skosxl:literalForm schema:name schema:description schema:alternateName }}
        <{encoded_iri}> ?prop ?o .}}
        """)
    try:
        sparql.setTimeout(300)
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()
        if isinstance(results,dict):
            value = utils.getResultsFromJSON(results)
            if isinstance(value,list) and len(value)>0:
                return True, value
            else:
                return False, []
        elif isinstance(results,Document):
            value = utils.getResultsFromXML(results)
            if isinstance(value,list) and len(value)>0:
                return True, value
            else:
                return False, []
        else:
            return False, []
    except Exception as e:
        return e

@log_in_out
def fetch_objects(endpoint_url, limit=1000, condition = ()):
    sparql = SPARQLWrapper(endpoint_url)
    offset = 0
    count = 0

    while True:
        query = f"""
        SELECT DISTINCT ?o
        WHERE {{
            ?s ?p ?o .
            FILTER(isIRI(?o))
        }}
        ORDER BY ?o
        LIMIT {limit}
        OFFSET {offset}
        """
        try:
            sparql.setQuery(query)
            sparql.setReturnFormat(JSON)
            results = sparql.query().convert()
            bindings = results.get("results", {}).get("bindings", [])

            if not bindings:
                break  # no more results

            for result in bindings:
                o = result["o"]["value"].lower()
                if o.endswith(condition):
                    count += 1
            offset += limit
        
        except Exception as e:
            return count
    return count

@log_in_out
def count_audio_objects_sparql(endpoint_url):
    sparql = SPARQLWrapper(endpoint_url)
    query = """
        SELECT (COUNT(DISTINCT ?o) AS ?audioCount)
        WHERE {
        ?s ?p ?o .
        FILTER(isIRI(?o)) .
        FILTER(REGEX(STR(?o), "\\\\.(mp3|wav|flac|ogg|m4a|aac|wma|aiff)$", "i"))
        }
    """
    try:
        sparql.setQuery(query)
        sparql.setTimeout(300)
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()
        if isinstance(results,dict):
            return int(results["results"]["bindings"][0]["audioCount"]["value"])
        elif isinstance(results,Document):
            value = utils.getResultsFromXMLCount(results)
            return value
        else:
            return False
    except Exception as e:
        return e
   
@log_in_out
def check_video_presence(endpoint_url, limit = True):
    sparql = SPARQLWrapper(endpoint_url)
    query = """
        SELECT ?o
        WHERE {
        ?s ?p ?o .
        FILTER(isIRI(?o)) .
        FILTER(REGEX(STR(?o), "\\\\.(mp4|avi|mov|wmv|flv|mkv|webm|mpeg|mpg)$", "i"))
        }
    """
    if limit:
        query += f"LIMIT {limit}"
    try:
        sparql.setQuery(query)
        sparql.setTimeout(300)
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()
        if isinstance(results,dict):
            value = utils.getResultsFromJSON(results)
            if isinstance(value,list) and len(value)>0:
                return True, value
            else:
                return False, []
        elif isinstance(results,Document):
            value = utils.getResultsFromXML(results)
            if isinstance(value,list) and len(value)>0:
                return True, value
            else:
                return False, []
        else:
            return False, []
    except Exception as e:
        return e, []
  
@log_in_out
def fetch_objects_value(endpoint_url, limit=1000, condition = ()):
    sparql = SPARQLWrapper(endpoint_url)
    offset = 0
    values = []

    while True:
        query = f"""
        SELECT DISTINCT ?o
        WHERE {{
            ?s ?p ?o .
            FILTER(isIRI(?o))
        }}
        ORDER BY ?o
        LIMIT {limit}
        OFFSET {offset}
        """
        try:
            sparql.setQuery(query)
            sparql.setReturnFormat(JSON)
            results = sparql.query().convert()
            bindings = results.get("results", {}).get("bindings", [])

            if not bindings:
                break  # no more results

            for result in bindings:
                o = result["o"]["value"].lower()
                if o.endswith(condition):
                    values.append(o)
            offset += limit
            
            return values
        except Exception as e:
            return e
   
@log_in_out
def check_audio_presence(endpoint_url, limit = True):
    sparql = SPARQLWrapper(endpoint_url)
    query = """
        SELECT ?o
        WHERE {
        ?s ?p ?o .
        FILTER(isIRI(?o)) .
        FILTER(REGEX(STR(?o), "\\\\.(mp3|wav|flac|ogg|m4a|aac|wma|aiff)$", "i"))
        }
    """
    if limit:
        query += f"LIMIT {limit}"
    try:
        sparql.setQuery(query)
        sparql.setTimeout(300)
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()
        if isinstance(results,dict):
            value = utils.getResultsFromJSON(results)
            if isinstance(value,list) and len(value)>0:
                return True, value
            else:
                return False, []
        elif isinstance(results,Document):
            value = utils.getResultsFromXML(results)
            if isinstance(value,list) and len(value)>0:
                return True, value
            else:
                return False, []
        else:
            return False, []
    except Exception as e:
        return e, []
    
@log_in_out    
def get_all_obj_in_meta(endpoint_url):
    sparql = SPARQLWrapper(endpoint_url)
    query = """
    PREFIX void: <http://rdfs.org/ns/void#>
    PREFIX dcat: <http://www.w3.org/ns/dcat#>
    PREFIX dcterms: <http://purl.org/dc/terms/>

    SELECT DISTINCT ?o
    WHERE {
        ?dataset a ?type ;
                ?p ?o .
        VALUES ?type { void:Dataset dcat:Dataset dcat:Distribution}
    }
    """
    try:
        sparql.setQuery(query)
        sparql.setTimeout(300)
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()
        if isinstance(results,dict):
            triples = utils.getResultsFromJSON(results)
            return triples
        elif isinstance(results,Document):
            triples = utils.getResultsFromXML(results)
            return triples
        else:
            return False
    except Exception as e:
        return e

@log_in_out
def get_apis_url(endpoint_url):
    sparql = SPARQLWrapper(endpoint_url)
    query = """
        PREFIX void: <http://rdfs.org/ns/void#>
        PREFIX dcat: <http://www.w3.org/ns/dcat#>
        PREFIX dcterms: <http://purl.org/dc/terms/>

        SELECT DISTINCT ?o
        WHERE {
            ?dataset a ?type ;
                    ?p ?o .
            VALUES ?type { void:Dataset dcat:Dataset dcat:Distribution }
            VALUES ?p { void:uriLookupEndpoint dcat:accessURL dcat:endpointURL }
        }
        LIMIT 1
    """
    try:
        sparql.setQuery(query)
        sparql.setTimeout(300)
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()
        if isinstance(results,dict):
            triples = utils.getResultsFromJSON(results)
            return triples
        elif isinstance(results,Document):
            triples = utils.getResultsFromXML(results)
            return triples
        else:
            return False
    except:
        return False

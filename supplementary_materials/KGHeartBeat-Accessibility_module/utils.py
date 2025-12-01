
import ssl
import requests
import re
from urllib.parse import urlparse
import ssl
import re
from urllib.parse import urlparse
import re
_NETLOC_PATTERN = re.compile(r'^[\w\-\.]+(?:\:\d+)?$')
from multiprocessing import Process, Queue
from Resources import Resources
import os
import json
import query
import VoIDAnalyses

def checkAvailabilityResource(url):
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.76 Safari/537.36'}
    ssl.match_hostname = lambda cert, hostname: True
    try:
        #url = checkRedirect(url) #BEFORE CHECK IF THE URL IS REDIRECTED
        response = requests.head(url,timeout=180,allow_redirects=True, verify=False) #3 MINUTES
        if response.status_code < 400:   #IF FAILS WITH A HEAD REQUEST, WE TEST WITH A GET (HEAD MAY NOT BE SUPPORTED)
            return True
        else:
            response = requests.head(url,timeout=180,allow_redirects=True, verify=False)
            if response.status_code < 400:
                return True
            else:
                newUrl = response.url
                if newUrl != url:
                    response = requests.head(newUrl,timeout=180,allow_redirects=True, verify=False)
                    if response.status_code < 400:
                        return True
                    else:
                         response = requests.head(newUrl,timeout=180,allow_redirects=True, verify=False)
                         if response.status_code < 400:
                             return True
                         else:
                             return False
    except Exception as e:
        return False
    except requests.exceptions.SSLError as e:
        print(f"SSL Error: {e}")
        return False

def toObjectResources(resourcesDH):
    otResources = []
    for i in range(len(resourcesDH)):
        path = resourcesDH[i].get('path')
        format = resourcesDH[i].get('format')
        description = resourcesDH[i].get('description')
        status = resourcesDH[i].get('status')
        title = resourcesDH[i].get('title')
        type = resourcesDH[i].get('type',None)
        resource = Resources(path,title,description,status,format,type)
        otResources.append(resource)
    return otResources

def getUrlVoID(otResources):
    if isinstance(otResources,list):
        for i in range(len(otResources)):
            resource = otResources[i]
            if resource.format is not None:
                if resource.format == 'meta/void' and resource.status == 'active':
                    urlV = resource.url
                    if isinstance(urlV,str):
                        return urlV
                elif resource.title is not None:
                    if 'void' in resource.title and resource.status == 'active':
                        urlV = resource.url
                        if isinstance(urlV,str):
                            return urlV
    else:
        return False

def is_url(string):
    if not isinstance(string, str) or not string.strip():
            return False
        
    try:
        parsed = urlparse(string)
    except Exception:
        return False
    
    netloc = parsed.netloc
    
    # Quick checks first (fail fast)
    if (not netloc or 
        parsed.scheme not in ("http", "https") or
        " " in netloc or
        ".." in netloc or 
        netloc[0] == "." or 
        netloc[-1] == "."):
        return False
    
    # Check for control characters (ASCII < 33)
    if any(ord(c) < 33 for c in netloc):
        return False
    
    # Validate netloc format with pre-compiled regex
    if not _NETLOC_PATTERN.match(netloc):
        return False
    
    # Extract domain (remove port if present)
    domain = netloc.split(':', 1)[0] if ':' in netloc else netloc
    
    # Validate domain labels
    labels = domain.split('.')
    for label in labels:
        label_len = len(label)
        # Combined check for efficiency
        if not label_len or label_len > 63 or not (label[0].isalnum() and label[-1].isalnum()):
            return False
    
    return True

def insertAvailability(resources):
    active = False
    for i in range(len(resources)):
        d = resources[i]
        url = d.get('path')
        active = checkAvailabilityResource(url)
        if active == True:
            d['status'] = 'active'
        else:
            d['status'] = 'offline'
    return resources

def check_common_acceppted_format(media_types):
    common_acceppted_format = ['application/rdf+xml','application/rdf+xml','text/turtle','application/x-ntriples','application/x-nquads', 'application/n-triples',
                               'application/trig','text/n3','rdf','text/rdf+n3','rdf/turtle','plain/text','application/octet-stream','application/x-gzip','gzip:ntriples']
    if isinstance(media_types,list):
        for media_type in media_types:
            if isinstance(media_type,str):
                if media_type.lower() in common_acceppted_format:
                    return True

        return False 
    else:
        return False

def check_if_zipped_dump(media_types):
    zipped_formats = ['application/x-gzip','application/gzip','application/zip','application/x-zip-compressed','multipart/x-zip']
    if isinstance(media_types,list):
        for media_type in media_types:
            if isinstance(media_type,str):
                if media_type.lower() in zipped_formats:
                    return True

        return False
    else:
        return False

def url_points_to_graph_file(url):
    SUPPORTED_EXTENSIONS = ['.ttl', '.rdf', '.nt', '.jsonld', '.xml']
    try:
        # Check if URL is valid
        result = urlparse(url)
        if not all([result.scheme, result.netloc]):
            return False

        response = requests.head(url, allow_redirects=True, timeout=10)
        if response.status_code != 200:
            return False

        # Check content-type header
        content_type = response.headers.get('Content-Type', '')
        if any(ct in content_type for ct in ['text/turtle', 'application/ld+json', 'application/rdf+xml', 'application/n-triples']):
            return True

        # Check file extension
        if any(url.lower().endswith(ext) for ext in SUPPORTED_EXTENSIONS):
            return True

        return False

    except requests.RequestException:
        return False

def update_local_kgs_spnapshot():
    url = "http://www.isislab.it:12280/kgsearchengine/brutalsearch?"
    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()
    
    here = os.path.dirname(os.path.abspath(__file__))
    save_path = os.path.join(here,'./API')
    save_path = os.path.join(save_path,"kgs_metadata_snapshot.json")
    with open(save_path, 'w') as json_file:
        json.dump(data, json_file, indent=4)

def return_updated_sparql_endpoint(id_kg):
    if id_kg == 'hungarian-national-library-catalog':
        return 'http://setaria.oszk.hu/sparql'
    if id_kg == 'deutsche-biographie':
        return 'https://data.deutsche-biographie.de/about/#sparql'
    if id_kg == 'culturalinkeddata':
        return 'https://datos.bne.es/sparql'
    if id_kg == 'dutch-ships-and-sailors':
        return 'https://dutchshipsandsailors.nl/?page_id=50'
    if id_kg == 'geographic-names-information-system-gnis':
        return 'https://gnis-ld.org/queries'
    if id_kg == 'the-european-library-open-dataset':
        return 'https://sparql.europeana.eu/'
    if id_kg == 'zbw-pressemappe20':
        return 'https://zbw.eu/beta/sparql/pm20/query'
    
    return False

def return_updated_rdf_dump(id_kg):
    dumps = [{
        'path' : '',
        'type' : 'full_download',
        'status' : '',
        'format' : ''
    }]
    if id_kg == 'pali-english-lexicon':
        dumps[0]['path'] = 'https://dictionary.sutta.org/'
        return dumps
    if id_kg == 'data-incubator-discogs':
        dumps[0]['path'] = 'http://archive.org/download/kasabi/discogs.gz'
        return dumps
    if id_kg == 'dbtropes':
        dumps[0]['path'] = 'http://dbtropes.org/static/dbtropes.zip'
        return dumps
    if id_kg == 'data-incubator-moseley':
        dumps[0]['path'] = 'https://archive.org/download/kasabi/moseley-folk-festival-data.gz'
        return dumps
    if id_kg == 'enslaved.org':
        dumps[0]['path'] = 'https://docs.enslaved.org/lod/'
        return dumps
    if id_kg == 'gutenberg':
        dumps[0]['path'] = 'https://github.com/alexdma/gutenberg-ld?tab=readme-ov-file'
        return dumps
    if id_kg == 'dutch-ships-and-sailors':
        dumps[0]['path'] = 'https://github.com/biktorrr/dss'
        return dumps
    if id_kg == 'dm2e':
        dumps[0]['path'] = 'https://github.com/dm2e'
        return dumps
    if id_kg == 'jita':
        dumps[0]['path'] = 'https://github.com/gbv/JITA?tab=readme-ov-file'
        return dumps
    if id_kg == 'eventkg':
        dumps[0]['path'] = 'https://github.com/saraabdollahi/EventKG-Click'
        dumps.append({
            'path' : 'https://zenodo.org/records/3568387',
            'type' : 'full_download',
            'status' : '',
            'format' : ''
        })
        return dumps
    if id_kg == 'roceeh-road':
        dumps[0]['path'] = 'https://github.com/gbv/JITA?tab=readme-ov-file'
        return dumps
    if id_kg == 'lcsh':
        dumps[0]['path'] = 'https://id.loc.gov/download/'
        return dumps
    if id_kg == 'lcsubjects':
        dumps[0]['path'] = 'https://id.loc.gov/download/'
        return dumps
    if id_kg == 'talis-openlibrary':
        dumps[0]['path'] = 'https://openlibrary.org/developers/dumps'
        return dumps
    if id_kg == 'bncf-ns':
        dumps[0]['path'] = 'https://www.data.gov.uk/dataset/6fa6a421-e515-4ab7-bbd6-1e60c2b60706/the-linked-open-british-national-bibliography'
        return dumps
    if id_kg == 'http:cultural-opposition.eu':
        dumps[0]['path'] = 'https://zenodo.org/records/3333540'
        return dumps

    return False

def mergeResources(resourcesDH,resourcesLODC):
    if isinstance(resourcesDH,list) and len(resourcesDH) > 0: #MERGE THE TWO LISTS OF RESOURCES FROM DH E LODC AND DELETING DUPLICATE
        found = False
        for i in range(len(resourcesLODC)): 
            urlLODC = resourcesLODC[i].get('path')
            for j in range(len(resourcesDH)):    #COMPARE AN ITEM IN THE LIST OF RESOURCES FROM LOD CLOUD WITH EACH ITEM IN THE LIST OF RESOURCES FROM DATAHUB
                urlDH = resourcesDH[j].get('path')
                if urlLODC == urlDH:
                    found = True        #IF THE LINK TO THE RESOURCES IS THE SAME, THEN WE DON'T ADD THE ITEM TO THE LIST
            if found == False:
                resourcesDH.append(resourcesLODC[i])
            else:
                found = False
        return resourcesDH
    else:
        return resourcesLODC    #IF IN DATAHUB THERE AREN'T RESOURCES, PRINT ONLY THE RESOURCES IN LOD CLOUD

def extract_media_type(resources_metadata):
    media_type = []
    for resource in resources_metadata:
        if 'format' in resource:
            if isinstance(resource['format'],str):
                if 'example' not in resource['format']:
                    media_type.append(resource['format'])
    
    return media_type

def count_syllables(word):
    word = word.lower()
    vowels = "aeiouy"
    syllables = 0
    prev_char_was_vowel = False
    
    for char in word:
        if char in vowels:
            if not prev_char_was_vowel:
                syllables += 1
                prev_char_was_vowel = True
        else:
            prev_char_was_vowel = False

    if word.endswith("e"):
        syllables -= 1
    if syllables == 0:
        syllables = 1
    return syllables

def flesch_reading_ease(text):
    sentences = re.split(r'[.!?]+', text)
    sentences = [s for s in sentences if s.strip()]

    words = re.findall(r'\w+', text)

    syllable_count = sum(count_syllables(word) for word in words)

    num_sentences = max(len(sentences), 1)
    num_words = max(len(words), 1)
    words_per_sentence = num_words / num_sentences
    syllables_per_word = syllable_count / num_words

    score = 206.835 - 1.015 * words_per_sentence - 84.6 * syllables_per_word
    return round(score, 2)

def run_with_timeout(func, args=(), timeout=300):
    q = Queue()
    p = Process(target=lambda q, *a: q.put(func(*a)), args=(q, *args))
    p.start()
    p.join(timeout)
    if p.is_alive():
        p.terminate()
        p.join()
        print(f"Terminated due to timeout after {timeout}s")
        return False
    return q.get() if not q.empty() else False

def check_metadata_media_type(sparql_endpoint, void_file_url, resources, media_type):
    # Check Search Engine Metadata resources
    objects = []
    if isinstance(resources, list) and len(resources) > 0:
        objects = resources
        for res in resources:
            path = res.get('path', '')
            if path and is_url(path):
                try:
                    response = requests.head(path, timeout=10, allow_redirects=True)
                    if media_type in response.headers.get('Content-Type', ''):
                        return 1, path
                except requests.RequestException:
                    continue

    # Check VoID file
    if is_url(void_file_url):
        void_file = VoIDAnalyses.parseVoID(void_file_url)
        objects = VoIDAnalyses.get_all_obj(void_file)
        for obj in objects:
            if is_url(obj):
                try:
                    response = requests.head(obj, timeout=10, allow_redirects=True)
                    if media_type in response.headers.get('Content-Type', ''):
                        return 1, obj
                except requests.RequestException:
                    continue

    # Check SPARQL endpoint
    if is_url(sparql_endpoint):
        objects = query.get_all_obj_in_meta(sparql_endpoint)
        if isinstance(objects, list):
            for obj in objects:
                if is_url(obj):
                    try:
                        response = requests.head(obj, timeout=10, allow_redirects=True)
                        if media_type in response.headers.get('Content-Type', ''):
                            return 1, obj
                    except requests.RequestException:
                        continue

    return 0, f"No media_type metadata found: {objects}"

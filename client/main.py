#
# Client-side python app for photoapp, this time working with
# web service, which in turn uses AWS S3 and RDS to implement
# a simple photo application for photo storage and viewing.
#
# Project 02 for CS 310, Spring 2023.
#
# Authors:
#   Lichen (Brittany) Zhang
#   Prof. Joe Hummel (initial template)
#   Northwestern University
#   Spring 2023
#

import requests  # calling web service
import jsons  # relational-object mapping

import uuid
import pathlib
import logging
import sys
import os
import base64

from configparser import ConfigParser

import matplotlib.pyplot as plt
import matplotlib.image as img


###################################################################
#
# classes
#
class User:
  userid: int  # these must match columns from DB table
  email: str
  lastname: str
  firstname: str
  bucketfolder: str


class Asset:
  assetid: int  # these must match columns from DB table
  userid: int
  assetname: str
  bucketkey: str


class BucketItem:
  Key: str      # these must match columns from DB table
  LastModified: str
  ETag: str
  Size: int
  StorageClass: str


###################################################################
#
# prompt
#
def prompt():
  """
  Prompts the user and returns the command number
  
  Parameters
  ----------
  None
  
  Returns
  -------
  Command number entered by user (0, 1, 2, ...)
  """
  print()
  print(">> Enter a command:")
  print("   0 => end")
  print("   1 => stats")
  print("   2 => users")
  print("   3 => assets")
  print("   4 => download")
  print("   5 => download and display")
  print("   6 => bucket contents")
  print("   7 => add or update user")
  print("   8 => upload")

  cmd = int(input())
  return cmd


###################################################################
#
# stats
#
def stats(baseurl):
  """
  Prints out S3 and RDS info: bucket status, # of users and 
  assets in the database
  
  Parameters
  ----------
  baseurl: baseurl for web service
  
  Returns
  -------
  nothing
  """

  try:
    #
    # call the web service:
    #
    api = '/stats'
    url = baseurl + api

    res = requests.get(url)
    #
    # let's look at what we got back:
    #
    if res.status_code != 200:
      # failed:
      print("Failed with status code:", res.status_code)
      print("url: " + url)
      if res.status_code == 400:  # we'll have an error message
        body = res.json()
        print("Error message:", body["message"])
      #
      return

    #
    # deserialize and extract stats:
    #
    body = res.json()
    #
    print("bucket status:", body["message"])
    print("# of users:", body["db_numUsers"])
    print("# of assets:", body["db_numAssets"])

  except Exception as e:
    logging.error("stats() failed:")
    logging.error("url: " + url)
    logging.error(e)
    return


###################################################################
#
# users
#
def users(baseurl):
  """
  Prints out all the users in the database
  
  Parameters
  ----------
  baseurl: baseurl for web service
  
  Returns
  -------
  nothing
  """

  try:
    #
    # call the web service:
    #
    api = '/users'
    url = baseurl + api

    res = requests.get(url)

    #
    # let's look at what we got back:
    #
    if res.status_code != 200:
      # failed:
      print("Failed with status code:", res.status_code)
      print("url: " + url)
      if res.status_code == 400:  # we'll have an error message
        body = res.json()
        print("Error message:", body["message"])
      #
      return

    #
    # deserialize and extract users:
    #
    body = res.json()
    #
    # let's map each dictionary into a User object:
    #
    users = []
    for row in body["data"]:
      user = jsons.load(row, User)
      users.append(user)
    #
    # Now we can think OOP:
    #
    for user in users:
      print(user.userid)
      print(" ", user.email)
      print(" ", user.lastname, ",", user.firstname)
      print(" ", user.bucketfolder)

  except Exception as e:
    logging.error("users() failed:")
    logging.error("url: " + url)
    logging.error(e)
    return


###################################################################
#
# assets
#
def assets(baseurl):
  """
  Prints out all the assets in the database

  Parameters
  ----------
  baseurl: baseurl for web service

  Returns
  -------
  nothing
  """

  try:
    #
    # call the web service:
    #
    api = '/assets'
    url = baseurl + api

    res = requests.get(url)

    #
    # let's look at what we got back:
    #
    if res.status_code != 200:
      # failed:
      print("Failed with status code:", res.status_code)
      print("url: " + url)
      if res.status_code == 400:  # we'll have an error message
        body = res.json()
        print("Error message:", body["message"])
      #
      return

    #
    # deserialize and extract assets:
    #
    body = res.json()
    #
    # let's map each dictionary into an Asset object:
    #
    assets = []
    for row in body["data"]:
      asset = jsons.load(row, Asset)
      assets.append(asset)
    #
    # Now we can think OOP:
    #
    for asset in assets:
      print(asset.assetid)
      print(" ", asset.userid)
      print(" ", asset.assetname)
      print(" ", asset.bucketkey)

  except Exception as e:
    logging.error("assets() failed:")
    logging.error("url: " + url)
    logging.error(e)
    return


###################################################################
#
# download
#
def download(baseurl, shouldDisplay=False):

  print('Enter asset id>')
  assetid = input()

  try:
    api = '/download'
    url = baseurl + api + '/' + str(assetid)
    res = requests.get(url)

    if res.status_code == 400:  # we'll have an error message
      body = res.json()
      print(body["message"])
      return

    if res.status_code != 200:
      print("Failed with status code:", res.status_code)
      print("url: " + url)
      return

    # Decode the response
    body = res.json()
    user_id = body["user_id"]
    asset_name = body["asset_name"]
    bucket_key = body["bucket_key"]
    data = body["data"]

    if len(data) == 0:
      print("No such asset...")
      return

    data_decoded = base64.b64decode(data)
    with open(asset_name, "wb") as output_file:
      output_file.write(data_decoded)

    print("userid: " + str(user_id))
    print("asset name: " + str(asset_name))
    print("bucket key: " + str(bucket_key))
    print('Downloaded from S3 and saved as \' %s \'' % asset_name)

    if shouldDisplay:
      display(asset_name)

  except Exception as e:
    logging.error("download() failed:")
    logging.error("url: " + url)
    logging.error(e)
    return

  return


###################################################################
#
# display
#
def display(file):
  image = img.imread(file)
  plt.imshow(image)
  plt.show()


###################################################################
#
# list bucket contents
#
def bucket(baseurl, start_after=""):

  try:
    api = '/bucket'
    url = baseurl + api
    if start_after != "":
      url += "?startafter=" + start_after
    res = requests.get(url)

    if res.status_code != 200:
      print("Failed with status code:", res.status_code)
      print("url: " + url)
      if res.status_code == 400:
        body = res.json()
        print("Error message:", body["message"])
      return

    # deserialize response
    body = res.json()
    # map each dictionary item into a BucketItem object
    bucket_items = []
    for row in body["data"]:
      item = jsons.load(row, BucketItem)
      bucket_items.append(item)

    for item in bucket_items:
      print(item.Key)
      print(" ", item.LastModified)
      print(" ", item.Size)

    if len(bucket_items) > 0:
      next_key = bucket_items[len(bucket_items) - 1].Key
      more = input("another page? [y/n]\n")
      if more == 'y':
        bucket(baseurl, next_key)

  except Exception as e:
    logging.error("bucket() failed:")
    logging.error("url: " + url)
    logging.error(e)
    return


###################################################################
#
# add user
#
def add_user(baseurl):
  # Hardcode an existing user for testing
  email = "hello"
  lastname = "lastname"
  firstname = "firstname"
  bucketfolder = str(uuid.uuid4())

  # Define the request payload
  payload = {
    "email": email,
    "firstname": firstname,
    "lastname": lastname,
    "bucketfolder": bucketfolder
  }

  try:
    # Make the API request
    url = baseurl + '/user'
    response = requests.put(url, json=payload)

    # Add or update user failed
    if response.status_code != 200:
      print("Failed with status code:", response.status_code)
      print("url: " + url)
      return

  except Exception as e:
    logging.error("add_user() failed:")
    logging.error("url: " + url)
    logging.error(e)
  return


###################################################################
#
# upload image
#
def upload(baseurl):
  filename = input("Enter file name>\n")
  userid = input("Enter user id>\n")

  # Open the file for binary read
  with open(filename, 'rb') as file:
    # Read the contents of the file
    contents = file.read()

  # Encode the contents as base64
  encoded = base64.b64encode(contents)

  # Convert the encoded contents to a string
  image_string = encoded.decode()

  # Define the request payload
  payload = {
    'data': image_string,
    'assetname': filename
  }

  try:
    # Make the API request
    url = baseurl + '/image' + '/' + userid
    response = requests.post(url, json=payload)

    # Image upload failed
    if response.status_code != 200:
      print("Failed with status code:", response.status_code)
      print("url: " + url)
      return

  except Exception as e:
    logging.error("upload() failed:")
    logging.error("url: " + url)
    logging.error(e)
    return


#########################################################################
# main
#
print('** Welcome to PhotoApp v2 **')
print()

# eliminate traceback so we just get error message:
sys.tracebacklimit = 0

#
# what config file should we use for this session?
#
config_file = 'photoapp-client-config'

print("What config file to use for this session?")
print("Press ENTER to use default (photoapp-config),")
print("otherwise enter name of config file>")
s = input()

if s == "":  # use default
  pass  # already set
else:
  config_file = s

#
# does config file exist?
#
if not pathlib.Path(config_file).is_file():
  print("**ERROR: config file '", config_file, "' does not exist, exiting")
  sys.exit(0)

#
# setup base URL to web service:
#
configur = ConfigParser()
configur.read(config_file)
baseurl = configur.get('client', 'webservice')

# print(baseurl)

#
# main processing loop:
#
cmd = prompt()

while cmd != 0:
  #
  if cmd == 1:
    stats(baseurl)
  elif cmd == 2:
    users(baseurl)
  elif cmd == 3:
    assets(baseurl)
  elif cmd == 4:
    download(baseurl)
  elif cmd == 5:
    download(baseurl, True)
  elif cmd == 6:
    bucket(baseurl)
  elif cmd == 7:
    add_user(baseurl)
  elif cmd == 8:
    upload(baseurl)
  else:
    print("** Unknown command, try again...")
  #
  cmd = prompt()

#
# done
#
print()
print('** done **')

import  {ConnectionManager} from './ConnectionManager.js'
import  {Check} from '../validation/Check.js'
import 'whatwg-fetch';


let transformValidResponse = function (response) {
  let result = {
    status: response.status || {},
    headers: response.headers || {},
    entity: {}
  }
  if (response.body) {

  }
  let path = response.url
  result.path = path.substring(path.indexOf('/', 8)) // http://foo.com/thisIsThePathWeMean
  result.key = path.substring(path.lastIndexOf('/') + 1);
  if (response.body) {
    return response.text().then((text) => {
      if (text) {
        result.entity = JSON.parse(text)
      }
      return result
    }).catch((e) => {
      console.log('Error parsing response:', e)
      throw e
    });
  } else {
    return new Promise((resolve) => resolve(result))
  }

}

function checkStatus(response) {
  let error;
  if(response instanceof TypeError){
    let message = response.message;
    if (response.message == "Failed to fetch") {
      message = response.message + ' (is the host available?)'
    }
    error = new Error(message)
    error.response = {
      status: -1
    }
  }
  else if (!(response.status >= 200 && response.status < 300)) {
    error = new Error(response.statusText)
    error.response = response
  }
  if(error){
    console.log("Status error: ", error)
    throw error
  }
  return response
}


let pathToUrl = function (path) {
  if (!path.startsWith('http')) {
    if (path.startsWith('/')) {
      path = path.substring(1)
    }
    path = ConnectionManager.baseUrl + path
  }
  if (path.endsWith('/')) {
    path = path.substring(0, path.length - 1)
  }
  return path
}

let getAuthHeader = function () {
  return 'Basic ' + btoa(ConnectionManager.username + ':' + ConnectionManager.password)
}

let remoteSet = function (path, entity, create = false) {
  let url = pathToUrl(path)
  console.log("Saving entity to: ", url)

  return fetch(url, {
    method: create ? "post" : "put",
    credentials: 'same-origin',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': getAuthHeader()
    },
    body: JSON.stringify(entity)
  }).then(checkStatus)
      .then(transformValidResponse)
      .then((result)=> {
        console.log(result)
        return result
      })
      .catch((e)=> {
        console.log("Save operation resulted in an error: ", e)
        throw e
      })
}

let remoteGet = function (path) {
  let url = pathToUrl(path)
  console.log("Getting entity from: ", url)
  return fetch(url, {
    credentials: 'same-origin',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': getAuthHeader()
    }
  }).catch(checkStatus).then(checkStatus).then(transformValidResponse)
}


let remoteDelete = function (path) {
  let url = pathToUrl(path)
  console.log("Deleting entity at: ", url)
  return fetch(url, {
    method: "delete",
    credentials: 'same-origin',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': getAuthHeader()
    }
  }).then(checkStatus).then(transformValidResponse).catch((e)=> {
    console.log("Delete operation resulted in an error: ", e)
    reject(e)
  })
}


export let RestDataStore = {

  setItem(path, entity, isNew) {
    path = Check.exists(path, "Cannot save with an empty key")
    entity = Check.exists(entity, "Cannot save empty values. Did you mean to remove?")
    return remoteSet(path, entity, isNew).then((response) => {
      if (isNew === true) {
        path = path + '/' + response.entity.id
      } else {
        path = path.substring(0, path.lastIndexOf('/') + 1) + response.entity.id
      }
      localStorage.setItem(path, JSON.stringify(entity))
      response.path = path
      return response
    })
  },
  getItem(path) {
    return new Promise((resolve, reject) => {
      remoteGet(path).then((response) => {
        resolve(response.entity)
      }).catch((err)=> {
        reject(err)
      })
    })
  },
  removeItem(path) {
    return remoteDelete(path);
  },


  childKeys(path){
    return new Promise((resolve, reject) => {
      remoteGet(path).then((response) => {
        resolve(Object.keys(response.entity))
      }).catch((err) => {
        reject(err)
      })
    })
  }
}
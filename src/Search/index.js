const Elasticlunr = require('./backends/Elasticlunr')

const Search = opt => {
  const options = Object.assign({
    type: 'elasticlunr',
    dataStore: null
  }, opt)

  const docTemplate = {
    id: null,
    url: null,
    urlParts: null,
    user: null,
    team: null,
    channel: null,
    timestamp: null,
    service: null,
    title: null,
    icon: null,
    description: null,
    text: null
  }

  const getSearchBackend = (type, docs, docTemplate) => {
    switch (type) {
      case 'elasticlunr':
        return Elasticlunr({
          docTemplate
        })
        break;
      default:
        throw `Invalid search strategy: ${type}`
    }
  }

  const searchBackend = getSearchBackend(options.type, {}, docTemplate)

  const saveDoc = (dataStore, searchBackend) => doc => (
    dataStore.saveDoc(doc).then(searchBackend.saveDoc)
  )

  const search = (dataStore, searchBackend) => searchString => (
    searchBackend.search(searchString).then(searchResults => {
      const docIds = searchResults.map(result => result.ref)
      return dataStore.getDocs(docIds)
    })
  )

  const loadDocs = (dataStore, searchBackend) => () => (
    dataStore.getAllDocs().then(searchBackend.loadDocs)
  )

  return {
    search: search(options.dataStore, searchBackend),
    saveDoc: saveDoc(options.dataStore, searchBackend),
    loadDocs: loadDocs(options.dataStore, searchBackend)
  }
}

module.exports = Search

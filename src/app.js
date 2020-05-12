const express = require("express");
const cors = require("cors");
const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function validateRepository(request, response, next) {
  const { id } = request.params;
  
  if(!isUuid(id)) {
    return response.status(400).json({
      message: 'Invalid repository id'
    });
  }

  const repositoryIndex = repositories.findIndex(repository => repository.id == id);
  
  if(repositoryIndex < 0) {
    return response.status(400).json({
      message: 'Repository not found'
    });
  }

  request.repositoryIndex = repositoryIndex;
  request.repository = repositories[repositoryIndex];
  return next();
}

app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;

  var repository = { 
    id: uuid(), title, url, techs, likes: 0
  };

  repositories.push(repository);

  return response.status(201).json(repository);
});

app.put("/repositories/:id", validateRepository, (request, response) => {
  const { title, url, techs } = request.body;
  
  var repository = {
    ...request.repository,
    title, url, techs
  }

  repositories[request.repositoryIndex] = repository

  return response.status(200).json(repository);

});

app.delete("/repositories/:id", validateRepository, (request, response) => {
  repositories.splice(request.repositoryIndex, 1);

  return response.status(204).send();
});

app.post("/repositories/:id/like", validateRepository, (request, response) => {
  var repository = {
    ...request.repository,
    likes: ++request.repository.likes
  }

  repositories[request.repositoryIndex] = repository

  return response.status(200).json(repository);
});

module.exports = app;

<div align="center">
  <img src="https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white">
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white">
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white">
  <img src="https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white">
</div>

<br />

<p align="center">
  <img src="assets/icon.png" alt="Logo" width="120" height="120" style="border-radius:15%;">
  <h3 align="center">Collaborative Whiteboard - Backend</h3>
  <p align="center">A platform for collaborative sketching and brainstorming. - Backend</p>
</p>

<p align="center">
  <a href="https://github.com/theXiaoWang/Collaborative-Whiteboard">
    <img src="https://img.shields.io/badge/Frontend%20Repo-%230074C1.svg?&style=for-the-badge&logo=Github&logoColor=white" alt="Frontend Repo" />
  </a>
</p>

## Run locally

1. Clone the repository
2. Install dependencies with `npm install`
3. Start the development server with `npm start`

## Client <-> Server interaction

1. Clients establish bidirectional connection with the server using `socket.io`.
2. After adding / changing any elements in the whiteboard, the client sends the changes to the server.
3. The server updates the state of the whiteboard in the database.
4. The change is broadcasted to all other clients in the room to update their whiteboards.

## Contributors

<a href="https://github.com/Kuuhhl/Collaborative-Whiteboard-Backend/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Kuuhhl/Collaborative-Whiteboard-Backend" />
</a>

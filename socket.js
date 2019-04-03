/**
 * Default
 */

on('default', async (data, socket) => {
  socket.send({ message: 'hello world'})
})

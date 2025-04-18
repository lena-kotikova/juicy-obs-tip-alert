<script setup>
import Alert from './components/Alert.vue'
</script>

<template>
  <div class="canvas-container">
    <div class="canvas">
      <Alert />
    </div>
  </div>
</template>

<style>
body {
  margin: 0;
  padding: 0;
  background: #0000FF;
  overflow: hidden;
}

.canvas-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #0000FF;
}

.canvas {
  width: 1920px;
  height: 1080px;
  position: relative;
  background: #0000FF;
}
</style>

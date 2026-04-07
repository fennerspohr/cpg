<template>
  <div class="h-screen bg-base-200 flex flex-col overflow-hidden">
    
    <Navbar />

    <main class="flex-1 overflow-auto">
      <slot />
    </main>
    
  </div>
</template>

<style>
body {
  margin: 0;
  overflow: hidden;
}
</style>
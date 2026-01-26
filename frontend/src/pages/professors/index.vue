<script setup>
definePageMeta({
  middleware: [
    function (to, from) {
      return navigateTo('/professors/tallers');
    }
  ]
});
</script>

<template>
  <div></div>
</template>

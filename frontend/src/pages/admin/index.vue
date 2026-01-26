<script setup>
definePageMeta({
  middleware: [
    function (to, from) {
      return navigateTo('/admin/tallers');
    }
  ]
});
</script>

<template>
  <div></div>
</template>

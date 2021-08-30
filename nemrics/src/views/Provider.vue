<template>
    <h1>Provider {{id}}.</h1>
</template>

<script>

  export default {
    name: 'Provider',
    data: () => ({
        id:Number
    }),
    
    created() {
        this.id = this.$route.params.id;
    },
  }
</script>

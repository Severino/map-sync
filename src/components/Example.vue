<template>
    <div class="d-flex flex-column h-100 p-5">
        <h1>{{ title }}</h1>
        <p>
            Delete the Example.vue file to remove this example from the app.
        </p>
    </div>
</template>

<script>
    export default {
        props: {
            title: {
                type: String,
                default: 'Tab Example',
            },
        },
    };
</script>
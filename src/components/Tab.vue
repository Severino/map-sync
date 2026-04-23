<template>
    <div class="map-sync-tab h-100 overflow-y-auto">
        <div>
            <header class="d-flex justify-content-between">
                <h3>Entity Type</h3>
                <button @click="refresh">⟳</button>
            </header>
            <details>
                <summary>Debug</summary>
                <pre>{{ entityTypes }}</pre>
            </details>
            <select v-model="activeEntityType">
                <option
                    disabled
                    value=""
                >
                    Please select one
                </option>
                <option
                    v-for="entityType in entityTypes"
                    :id="entityType.id"
                    :key="entityType.id"
                    :value="entityType"
                >
                    {{ entityType?.thesaurus_concept?.labels[0]?.label ?? "Missing Label" }}
                </option>
            </select>
        </div>
        <div>
            <h3>Attribute</h3>
            <details>
                <summary>Debug</summary>
                <pre>{{ entityTypes }}</pre>
            </details>
            <p v-if="attributeList.length === 0">
                Entity Type has no attributes with datatype "geography". Please select another Entity Type.
            </p>
            <select
                v-model="activeAttribute"
                :disabled="!activeEntityType || attributeList.length === 0"
            >
                <option
                    disabled
                    value=""
                >
                    Please select one
                </option>
                <option
                    v-for="attribute in attributeList"
                    :id="attribute.id"
                    :key="attribute.id"
                    :value="attribute"
                >
                    {{ attribute?.thesaurus_concept?.labels[0].label ?? "Missing Label" }} [{{ attribute.datatype }}]
                </option>
            </select>
        </div>
        <hr>
        <LoadingButton
            class="mt-3 ms-auto"
            color="primary"
            :disabled="!activeAttribute || generating"
            :loading="generating"
            @click="generate"
        >
            Generate
        </LoadingButton>
        <div
            v-if="error"
            class="danger"
        >
            {{ error }}
        </div>
        <div
            v-if="success"
            class="success"
        >
            {{ success }}
        </div>
    </div>
</template>

<script setup>
    import { nextTick } from 'process';
    import { computed, onMounted, ref, watch } from 'vue';

    import { LoadingButton } from 'dhc-components';

    const t = SpPS.data.t;

    const error = ref('');
    const success = ref('');
    const entityTypes = ref([]);
    const activeEntityType = ref(null);
    const activeAttribute = ref(null);
    const generating = ref(false);

    watch(activeAttribute, (newValue) => {
        localStorage.setItem('mapsync_activeAttribute', newValue ? newValue.id : '');
        resetMessages();
    });

    watch(activeEntityType, (newValue) => {
        if(attributeList.value.length > 0) {
            activeAttribute.value = attributeList.value[0];
        }

        localStorage.setItem('mapsync_activeEntityType', newValue ? newValue.id : '');
        resetMessages();
    });

    async function fetch() {
        try {
            entityTypes.value = await SpPS.api.http('get', '/mapsync/entity-types');
            nextTick(() => {
                const storedEntityTypeId = parseInt(localStorage.getItem('mapsync_activeEntityType'));
                activeEntityType.value = entityTypes.value.find((et) => et.id === storedEntityTypeId) || null;

                if(activeEntityType.value) {
                    const storedAttributeId = parseInt(localStorage.getItem('mapsync_activeAttribute'));
                    activeAttribute.value = attributeList.value.find((attr) => attr.id === storedAttributeId) || null;
                }
            });
        } catch(error) {
            console.error(error);
            error.value = error;
        }
    }

    async function refresh() {
        await fetch();
    }

    onMounted(() => {
        fetch();
    });

    const resetMessages = () => {
        error.value = '';
        success.value = '';
    };

    const attributeList = computed(() => {
        if(!activeEntityType.value) return [];
        return activeEntityType.value.attributes.filter((attribute) => attribute.datatype === 'geography');
    });

    const generate = async () => {
        resetMessages();

        const entityTypeId = activeEntityType.value ? activeEntityType.value.id : null;
        const attributeId = activeAttribute.value ? activeAttribute.value.id : null;

        if(!entityTypeId || !attributeId) {
            error.value = 'Entity Type and Attribute must be selected.';
            return;
        }

        generating.value = true;
        try {
            const response = await SpPS.api.http('post', `/mapsync/sync/${entityTypeId}/${attributeId}`);
            success.value = 'Generation successful!';
        } catch(error) {
            console.error(error);
            error.value = error;
        } finally {
            generating.value = false;
        }
    };

</script>
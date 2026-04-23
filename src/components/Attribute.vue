<template>
    <div class="d-flex align-items-center gap-2">
        <span style="color: red !important; font-weight: bold;">[TEMPLATE]</span>
        <input
            v-model="v.value"
            class="form-control"
            type="text"
            :name="name"
        >
    </div>
</template>

<script>
    import {
        reactive,
        watch,
    } from 'vue';
    import * as yup from 'yup';
    import { useField } from 'vee-validate';

    export default {
        props: {
            value: {
                type: String,
                required: true
            },
            name: {
                type: String,
                required: true
            },
            disabled: {
                type: Boolean,
                required: false,
                default: false,
            },
            title: {
                type: String,
                default: 'Tab Example',
            },
        },
        emits: ['change'],
        setup(props, { emit }) {
            const resetFieldState = _ => {
                v.resetField({
                    value: props.value
                });
            };
            const undirtyField = _ => {
                v.resetField({
                    value: v.value,
                });
            };

            // DATA
            const {
                value: fieldValue,
                meta,
                resetField,
            } = useField(`str_${props.name}`, yup.string(), {
                initialValue: props.value,
            });
            const state = reactive({

            });
            const v = reactive({
                value: fieldValue,
                meta,
                resetField,
            });

            watch(_ => props.value, (newValue, oldValue) => {
                resetFieldState();
            });
            watch(_ => v.value, (newValue, oldValue) => {
                if(!v.meta.validated) return;
                emit('change', {
                    dirty: v.meta.dirty,
                    valid: v.meta.valid,
                    value: v.value,
                });
            });

            // RETURN
            return {
                // HELPERS
                // LOCAL
                resetFieldState,
                undirtyField,
                // STATE
                state,
                v,
            };
        },
    };
</script>
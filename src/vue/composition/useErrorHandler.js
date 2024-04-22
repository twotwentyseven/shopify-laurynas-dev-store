import { computed, reactive } from "vue";


export default function useErrorHandler() {
	const state = reactive({
		error: null,
		errorMessages: []
	});

	function handleErrors(error) {
		if (error) {
			state.error = true;
			state.errorMessages.push(error);
		}
	}

	function resetErrors() {
		state.error = null;
		state.errorMessages = [];
	}

	const error = computed(() => state.error);
	const errorMessages = computed(() => state.errorMessages);

	return {
		error,
		errorMessages,
		handleErrors,
		resetErrors
	}
}
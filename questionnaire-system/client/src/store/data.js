import { defineStore } from "pinia";

export const useDataStore = defineStore("data", {
  state: () => ({
    surveys: [],
    categories: [],
    currentSurvey: null,
    comments: [],
    loading: false,
    error: null,
  }),
  getters: {
    getSurveyById: (state) => (id) =>
      state.surveys.find((survey) => survey.id === parseInt(id)),
    publishedSurveys: (state) =>
      state.surveys.filter((survey) => survey.status === "published"),
    surveysByCategory: (state) => (categoryId) =>
      state.surveys.filter(
        (survey) => survey.categoryId === parseInt(categoryId)
      ),
  },
  actions: {
    setSurveys(surveys) {
      this.surveys = surveys;
    },
    setCategories(categories) {
      this.categories = categories;
    },
    setCurrentSurvey(survey) {
      this.currentSurvey = survey;
    },
    setComments(comments) {
      this.comments = comments;
    },
    addComment(comment) {
      this.comments.unshift(comment);
    },
    setLoading(loading) {
      this.loading = loading;
    },
    setError(error) {
      this.error = error;
    },
    clearError() {
      this.error = null;
    },
  },
});

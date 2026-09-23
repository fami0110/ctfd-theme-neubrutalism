import Alpine from "alpinejs";
import CTFd from "../index";
import { buildCategoryBreakdown, getPercentage } from "../utils/profile-graphs";
import { loadProfileChartRuntime } from "../utils/graphs/profile-chart-runtime";

window.Alpine = Alpine;

Alpine.data("UserGraphs", () => ({
  solves: null,
  fails: null,
  awards: null,
  solveCount: 0,
  failCount: 0,
  awardCount: 0,
  themeChangeHandler: null,

  getAttemptTotal() {
    return this.solveCount + this.failCount;
  },

  getSolvePercentage() {
    return getPercentage(this.solveCount, this.getAttemptTotal());
  },

  getSolvePercentageValue() {
    return Number(this.getSolvePercentage());
  },

  getFailPercentage() {
    return getPercentage(this.failCount, this.getAttemptTotal());
  },

  getFailPercentageValue() {
    return Number(this.getFailPercentage());
  },

  getCategoryBreakdown() {
    return buildCategoryBreakdown(this.solves.data);
  },

  async renderScoreGraph() {
    if (!this.$refs.scoregraph || !this.solves || !this.awards) {
      return;
    }

    const { getOption, embed } = await loadProfileChartRuntime();
    const optionMerge = window.userScoreGraphChartOptions;

    embed(
      this.$refs.scoregraph,
      getOption(
        CTFd.user.id,
        CTFd.user.name,
        this.solves.data,
        this.awards.data,
        optionMerge,
      ),
    );
  },

  async init() {
    this.solves = await CTFd.pages.users.userSolves("me");
    this.fails = await CTFd.pages.users.userFails("me");
    this.awards = await CTFd.pages.users.userAwards("me");

    this.solveCount = this.solves.meta.count;
    this.failCount = this.fails.meta.count;
    this.awardCount = this.awards.meta.count;

    if (this.$refs.scoregraph) {
      this.themeChangeHandler = () => this.renderScoreGraph();
      window.addEventListener("ctfd:themechange", this.themeChangeHandler);
      await this.renderScoreGraph();
    }
  },

  destroy() {
    if (this.themeChangeHandler) {
      window.removeEventListener("ctfd:themechange", this.themeChangeHandler);
      this.themeChangeHandler = null;
    }
  },
}));

Alpine.start();

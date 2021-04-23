<template>
  <div id="app">
    <!-- <input-file></input-file> -->
    <button
      v-for="tab in tabs"
      :key="tab"
      :class="['tab-button', { active: currentTab === tab }]"
      @click="currentTab = tab"
    >
      {{ tab }}
    </button>

    <keep-alive>
      <component :is="currentTab" class="tab"></component>
    </keep-alive>
  </div>
</template>

<script>
import Encode from "./components/Input";
import Decode from "./components/output"

export default {
  name: "my-app",
  data() {
    return {
      currentTab: "Encode",
      tabs: ["Encode", "Decode"]
    }
  },
  components: {
    Encode,
    Decode
  },
};
</script>

<style>
/* CSS */
#app {
  padding: 30px 50px;
}

.el-card__body {
  padding: 0 !important;
  font-size: 13px;
  overflow-y: auto;
  height: 120px;
}

/*定义滚动条高宽及背景
 高宽分别对应横竖滚动条的尺寸*/
::-webkit-scrollbar {
  width: 3px;
  height: 16px;
  background-color: #f5f5f5;
}
/*定义滚动条轨道
 内阴影+圆角*/
::-webkit-scrollbar-track {
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  background-color: #f5f5f5;
}
/*定义滑块
 内阴影+圆角*/
::-webkit-scrollbar-thumb {
  border-radius: 10px;
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
  background-color: #555;
}

.tab-button {
  padding: 6px 10px;
  border: 1px solid grey;
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
  cursor: pointer;
  background: #f0f0f0;
  margin-bottom: -1px;
  margin-right: 1px;
}
.tab-button:hover {
  background: #e0e0e0;
}
.tab-button.active {
  background: #e0e0e0;
}
.tab {
  border: 1px solid #ccc;
  padding: 10px;
}

.container {
  display: flex;
}
.input {
  width: 300px;
}
.showArea {
  width: 500px;
  /* background-color: black; */
  overflow-y: auto;
}
.fileList {
  height: 210px;
  overflow-y: auto;
}
.log {
  margin-top: 20px;
  height: 180px;
}
.el-icon-close,
.el-icon-check {
  display: none;
}
.item:hover {
  background-color: rgba(188, 190, 190, 0.308);
  cursor: pointer;
}
.item:hover .el-icon-close,
.item:hover .el-icon-check {
  display: inline;
}
.item span {
  margin-right: 10px;
}
.log_info {
  margin: 5px 10px;
}
.name {
  color: #303133;
}
.info {
  color: #909399;
}
</style>

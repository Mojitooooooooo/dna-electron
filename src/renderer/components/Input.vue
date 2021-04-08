<template>
  <div class="input">
    <el-form ref="form" label-width="80px" size="mini">
      <template v-for="item in encodeArgs">
        <el-form-item :label="`${item.label}:`" :key="item.label">
          <el-input-number
            v-model="item.default"
            :precision="item.precision"
            :step="item.step"
            :title="item.dsc"
          ></el-input-number>
        </el-form-item>
      </template>
    </el-form>
    <el-button type="primary" @click="chooseFile">选取文件</el-button>
    <el-button :disabled="!fileBuffer" @click="processing">开始编译</el-button>
    <div class="el-upload__tip">选择文件进行上传</div>
  </div>
</template> 
<script>
const { ipcRenderer } = require("electron");
const fs = require("fs").promises;
import to from "await-to-js";
import { read_file } from "../../util/processing";
import { DNAFountain } from "../../util/Fountain";

export default {
  name: "InputFile",
  data() {
    return {
      fileList: [],
      encodeArgs: [
        {
          label: "size",
          default: 32,
          dsc: "number of information bytes per message",
          precision: 0,
          step: 1,
        },
        {
          label: "max_ho",
          default: 3,
          dsc: "the largest number of nt in a homopolymer",
          precision: 0,
          step: 1,
        },
        {
          label: "gc",
          default: 0.05,
          dsc:
            "the fraction of gc content above/below 0.5 (example:0.1 means 0.4-0.6)",
          precision: 2,
          step: 0.01,
        },
        {
          label: "rs",
          default: 2,
          dsc: "Number of bytes for rs codes",
          precision: 0,
          step: 1,
        },
        {
          label: "delta",
          default: 0.001,
          dsc: "Degree distribution tuning parameter",
          precision: 3,
          step: 0.001,
        },
        {
          label: "c_dist",
          default: 0.025,
          dsc: "Degree distribution tuning parameter",
          precision: 3,
          step: 0.001,
        },
        {
          label: "stop",
          default: 72000,
          dsc: "Maximal number of oligos",
          precision: 0,
          step: 1,
        },
        {
          label: "alpha",
          default: 0.07,
          dsc:
            "How many more fragments to generate on top of first k (example: 0.1 will generate 10 percent more fragments)",
          precision: 2,
          step: 0.01,
        },
      ],
      fileBuffer: null,
    };
  },
  methods: {
    async chooseFile() {
      let [err1, file] = await to(ipcRenderer.invoke("file-choose"));
      if (err1) console.log(err1);
      if (file.canceled) return;

      // 这里的fileBuffer里面每一项都是一字节
      let [err2, fileBuffer] = await to(fs.readFile(file.filePaths[0]));
      if (err2) console.log(err2);
      this.fileBuffer = fileBuffer;
    },
    processing() {
      let args = {};
      this.encodeArgs.forEach((item) => {
        args[item.label] = item.default;
      });
      
      let  { f_in, file_size } = read_file(this.fileBuffer, this.encodeArgs[0].default);
      let fountain = new DNAFountain(
        f_in,
        file_size,
        args.size,
        args.rs,
        args.max_ho,
        args.gc,
        args.delta,
        args.c_dist,
        args.alpha,
        args.stop
      );
      console.log(fountain);
    },
  },
};
</script>
<style scoped>
.input {
  width: 300px;
}
</style>
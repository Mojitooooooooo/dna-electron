<template>
  <div class="container">
    <!-- 参数区域 -->
    <div class="input">
      <el-form ref="form" label-width="90px" size="mini">
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
      <el-button :disabled="fileList.length == 0" @click="batchProcessing"
        >批量编译</el-button
      >
    </div>

    <!-- 展示区域 -->
    <div class="showArea">
      <el-collapse v-model="activeNames" class="fileList">
        <el-collapse-item title="待编译文件列表" name="1">
          <template v-for="(file, index) in fileList">
            <div :key="file.name" class="item">
              <i class="el-icon-paperclip"></i>
              <span>{{ file.name }}</span>
              <i
                class="el-icon-check"
                title="开始编译"
                @click="processing(file)"
              ></i>
              <i class="el-icon-close" @click="deleteFile(index)"></i>
              <i
                class="el-icon-loading"
                v-show="file.percentage !== 0 && file.percentage !== 100"
              ></i>
              <el-progress
                :percentage="file.percentage"
                v-show="file.percentage !== 0 && file.percentage !== 100"
                :show-text="false"
                :stroke-width="2"
                style="width: 200px"
              ></el-progress>
            </div>
          </template>
        </el-collapse-item>
        <el-collapse-item title="编译dna序列信息" name="2">
          <template v-for="file in fileList">
            <div
              v-if="!!file.outName"
              :key="file.outName"
              class="item"
              @click="openFile(file)"
            >
              <i class="el-icon-price-tag"></i>
              <span>{{ file.outName }}</span>
            </div>
          </template>
        </el-collapse-item>
      </el-collapse>
      <el-card class="log">
        <div slot="header" class="clearfix">
          <span>日志信息</span>
        </div>
        <div v-for="(info, index) in infos" :key="index" class="log_info">
          <span class="name">[{{info.name}}]: </span>
          <span class="info">{{info.information}}</span>
        </div>
      </el-card>
    </div>
  </div>
</template> 
<script>
const { ipcRenderer, shell } = require("electron");
const fs = require("fs");
const path = require('path')
const fsPromise = fs.promises;

import to from "await-to-js";
import { read_file } from "../../util/processing";
import { DNAFountain } from "../../util/Fountain";
import { prepare } from "../../util/util";

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
      outfileList: [],
      activeNames: [],
      infos: []
    };
  },
  created() {
    window.infos = this.infos
  },
  methods: {
    async chooseFile() {
      let [err1, file] = await to(ipcRenderer.invoke("file-choose"));
      if (err1) console.log(err1);
      if (file.canceled) return;

      // 这里的fileBuffer里面每一项都是一字节
      let fileReading = Promise.all(
        file.filePaths.map((url) => {
          let temp = url.split("\\");
          this.infos.push({name: temp[temp.length - 1], information: 'Reading the file. This may take a few mintues'})
          return fsPromise.readFile(url).then((buffer) => {
            return {
              name: temp[temp.length - 1],
              fileBuffer: buffer,
              percentage: 0,
              url: url,
            };
          });
        })
      );
      let [err2, fileList] = await to(fileReading);
      if (err2) console.log(err2);
      this.fileList.push(...fileList);
    },
    openFile(file) {
      shell.showItemInFolder(path.resolve(`${file.name}.out.dna`));
    },
    deleteFile(index) {
      this.fileList.splice(index, 1);
    },
    batchProcessing() {
      this.fileList.forEach((file) => {
        this.processing(file);
      });
    },
    processing(file) {
      const out = fs.createWriteStream(`./${file.name}.out.dna`);
      file.percentage = 0;
      let args = {};
      this.encodeArgs.forEach((item) => {
        args[item.label] = item.default;
      });

      let { f_in, file_size } = read_file(
        file.fileBuffer,
        this.encodeArgs[0].default,
        file.name
      );
      let f = new DNAFountain(
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

      console.log(f)

      this.infos.push({name: file.name, information: `Upper bounds on packets for decoding is ${f.PRNG.K * f.PRNG.Z} (x${f.PRNG.Z})  with ${f.PRNG.delta} probability`})

      prepare(args.max_ho);
      let used_bc = {};

      // todo:webworker
      this.genDrop(f, used_bc, out, file);
    },
    genDrop(f, used_bc, out, file) {
      // hack为了能进入循环,不想改了
      f.good++;
      while (f.good % Math.floor(f.final / 100) !== 0) {
        let d = f.droplet();
        if (f.screen(d)) {
          if (used_bc[d.seed]) {
            this.infos.push({name: file.name, information: `Seed ${d.seed}} has been seen before\nDone`})
            continue;
          }

          out.write(`>packet ${f.good}_${d.degree}\n`);
          out.write(`${d.to_human_readable_DNA()}\n`);

          used_bc[d.seed] = d;

          file.percentage = Math.floor((f.good / f.final) * 100);

          if (file.percentage == 100) {
            file.outName = `${file.name}.out.dna`;
            this.infos.push({name: file.name, information: `Finished. Generated ${f.good} packets out of ${f.tries} tries (${f.good / f.tries}`})
          }
        }
      }

      if (f.good < f.final) {
        setTimeout(() => {
          this.genDrop(f, used_bc, out, file);
        }, 0);
      }
    },
  },
};
</script>
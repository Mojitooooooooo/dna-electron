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
        >批量解码</el-button
      >
    </div>

    <!-- 展示区域 -->
    <div class="showArea">
      <el-collapse v-model="activeNames" class="fileList">
        <el-collapse-item title="待解码文件列表" name="1">
          <template v-for="(file, index) in fileList">
            <div :key="file.name" class="item">
              <i class="el-icon-paperclip"></i>
              <span>{{ file.name }}</span>
              <i
                class="el-icon-check"
                title="开始解码"
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
        <el-collapse-item title="解码文件" name="2">
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
          <span class="name">[{{ info.name }}]: </span>
          <span class="info">{{ info.information }}</span>
        </div>
      </el-card>
    </div>
  </div>
</template> 
<script>
const { ipcRenderer, shell } = require("electron");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

import to from "await-to-js";
import { Glass } from "../../util/Glass";
import { prepare } from "../../util/util";

import { Encoder, Decoder } from "../../util/lib/index";
import { error } from 'util';

export default {
  name: "InputFile",
  data() {
    return {
      fileList: [],
      encodeArgs: [
        {
          label: "header_size",
          default: 4,
          dsc: "number of bytes for the header",
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
          dsc: "range of gc content",
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
          label: "chunk_num",
          default: 67088,
          dsc: "the total number of chunks in the file",
          precision: 0,
          step: 1,
        },
        {
          label: "max_ham",
          default: 0,
          dsc:
            "How many differences between sequenced DNA and corrected DNA to tolerate",
          precision: 0,
          step: 1,
        },
      ],
      outfileList: [],
      activeNames: [],
      infos: [],
    };
  },
  created() {
    window.infos = this.infos;
    let a = Buffer.from([
      137,
      80,
      78,
      71,
      13,
      10,
      26,
      10,
      0,
      0,
      0,
      13,
      73,
      72,
      68,
      82,
      0,
      0,
      1,
      0,
      0,
      0,
      1,
      0,
      8,
      6,
      0,
      0,
      0,
      92,
      114,
      168,
    ]);
    let b = new Encoder(2).encode(a);

    console.log(b)
    let data_corrected = new Decoder(2).correct(b)
    data_corrected = data_corrected.slice(0, data_corrected.length - 2)
    console.log(data_corrected)
    let seed_array = data_corrected.slice(0, 4)
    console.log(seed_array)
    let payload = data_corrected.slice(4)
    console.log(payload)
  },
  methods: {
    async chooseFile() {
      let [err1, file] = await to(ipcRenderer.invoke("file-choose"));
      if (err1) console.log(err1);
      if (file.canceled) return;

      // 这里的fileBuffer里面每一项都是一字节
      let fileReading = file.filePaths.map((url) => {
        let temp = url.split("\\");
        return {
          name: temp[temp.length - 1],
          percentage: 0,
          url: url,
        };
      });

      this.fileList.push(...fileReading);
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
    async processing(file) {
      // const out = fs.createWriteStream(`./${file.name}.out.dna`);
      // file.percentage = 0;
      let args = {};
      this.encodeArgs.forEach((item) => {
        args[item.label] = item.default;
      });

      let g = new Glass(
        args.chunk_num,
        args.header_size,
        args.rs,
        args.c_dist,
        args.delta,
        true,
        args.gc,
        args.max_ho,
        args.max_ham,
        true,
        32,
        false
      );

      prepare(args.max_ho);

      let line = 0;
      let errors = 0;
      let seen_seeds = new Proxy(
        {},
        {
          get: (target, name) => (name in target ? target[name] : 0),
        }
      );

      const fileStream = fs.createReadStream(file.url);
      const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
      });

      for await (const dna of rl) {
        let coverage = 0;

        if (dna.includes("N")) {
          continue;
        }

        line += 1;
        let { seed, data } = g.add_dna(dna);

        if(seed == -1) {
          errors += 1
        }else {
          seen_seeds[seed] += 1
        }

        if(g.isDone()) {
          break
        }
      }

      let outstring = g.getString()
      let fd = fs.openFile(`./${file.name}.out.bin`, 'wb')
      fs.write(fd, outstring)
    },
  },
};
</script>
#!/bin/bash

src = `pwd`
cd mobile && docker build -t vaccination_app_build .
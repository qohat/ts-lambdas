##Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
##SPDX-License-Identifier: MIT-0

<<<<<<< HEAD
STACK_NAME=AnsweringLambdasStack
=======
STACK_NAME=ServerlessTypescriptDemoStack
>>>>>>> adb801b (initial)

API_URL=$(aws cloudformation describe-stacks --stack-name $STACK_NAME \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiURL`].OutputValue' \
  --output text)

echo $API_URL

<<<<<<< HEAD
ROOT_FOLDER=$(pwd)

artillery run "$ROOT_FOLDER/load-test/load-test.yml" --target "$API_URL"
=======
artillery run load-test.yml --target "$API_URL"
>>>>>>> adb801b (initial)

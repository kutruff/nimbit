#AWS cli v2 here: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html#cliv2-linux-install  
#cli setup here: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-quickstart.html
# Made a AWS group with the AmazonS3ReadOnlyAccess policy, and that was sufficient and added user to it.
# aws configure with us-east-1 default region and json as default format

aws s3 sync s3://archive.themeparks.wiki/e957da41-3552-4cf6-b636-5babc5cbc4e5 . 


variable "region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "ap-south-1"
}

variable "project" {
  description = "Name prefix for all resources"
  type        = string
  default     = "mediquery"
}

variable "my_ip_cidr" {
  description = "Your public IP in CIDR form (x.x.x.x/32). Allowed to SSH in and reach Jenkins."
  type        = string
}

variable "public_key_path" {
  description = "Path to the SSH public key to install on the servers"
  type        = string
  default     = "~/.ssh/mediquery.pub"
}

variable "jenkins_instance_type" {
  description = "EC2 size for the Jenkins server"
  type        = string
  default     = "t3.medium"
}

variable "k8s_instance_type" {
  description = "EC2 size for the k3s server"
  type        = string
  default     = "t3.xlarge"
}

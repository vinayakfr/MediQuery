output "jenkins_ip" {
  value = aws_eip.jenkins.public_ip
}

output "k8s_ip" {
  value = aws_eip.k8s.public_ip
}

output "ssh_jenkins" {
  value = "ssh -i ~/.ssh/mediquery ubuntu@${aws_eip.jenkins.public_ip}"
}

output "ssh_k8s" {
  value = "ssh -i ~/.ssh/mediquery ubuntu@${aws_eip.k8s.public_ip}"
}

output "app_url" {
  value = "http://${aws_eip.k8s.public_ip}"
}

output "ssm_jenkins" {
  value = "aws ssm start-session --target ${aws_instance.jenkins.id}"
}

output "ssm_k8s" {
  value = "aws ssm start-session --target ${aws_instance.k8s.id}"
}

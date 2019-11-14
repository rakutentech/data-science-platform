FROM qcdatainc/centos-jdk

# install nbconvert
RUN yum install -y epel-release && yum install -y pandoc && yum install -y git \
    && git clone https://github.com/jupyter/nbconvert.git && cd nbconvert && yum install -y python-setuptools \
    && easy_install pip && pip install --upgrade setuptools && pip install -e .

COPY ./target/knowledge-hub-api.jar app.jar
COPY entrypoint.sh .

RUN mkdir -p /knowledge_hub/2019/83/1554702268180/
COPY ./testdata/* /knowledge_hub/2019/83/1554702268180/

RUN chmod +x entrypoint.sh
EXPOSE 8080
ENTRYPOINT ["/entrypoint.sh"]

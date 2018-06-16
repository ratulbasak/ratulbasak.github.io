---
layout: post
title: Serving Private Content of S3 through CloudFront Signed URL
---


<div class="message">
  Howdy! This is an example blog post that shows several types of HTML content supported in this theme.
</div>

*CloudFront* is a popular web service by <a href="https://aws.amazon.com">Amazon</a>. It speeds up distribution of static and dynamic content to the users. CloudFront rapidly distributes the contents by routing each user request to the edge location that can best serve your content. Typically, this is a CloudFront edge server that provides the fastest delivery to the viewer. You create a CloudFront distribution to tell CloudFront where you want content to be delivered from, and the details about how to track and manage content delivery. Then CloudFront uses computers — edge servers — that are close to your viewers to deliver that content quickly when someone wants to see it or use it.

AWS <a href="https://aws.amazon.com/s3/">S3</a> is an object level storage built to store and retrieve any amount of data from anywhere on the Internet. It’s a simple storage service that offers an extremely durable, highly available, and infinitely scalable data storage infrastructure at very low costs.

In this post, we’ll see how we can serve the contents of s3 through CloudFront generating a signed URL. By doing this we can secure object endpoint and also get the contents much faster.

![alt text](https://cdn-images-1.medium.com/max/1000/1*BsS33Afv1Qzm7DU-XLJX0g.png)


* Restrict access to objects in CloudFront edge caches
* Restrict access to objects in your Amazon S3 bucket

Create CloudFront Keypair. You need to login to your AWS account using root credentials. You cannot do this via an IAM user at the moment.

> Curabitur blandit tempus porttitor. Nullam quis risus eget urna mollis ornare vel eu leo. Nullam id dolor id nibh ultricies vehicula ut id elit.

![](https://cdn-images-1.medium.com/max/1000/1*8ibHvdNTy_yJhtxI32dcXw.png)

Go to **My Security Credentials** then **Cloudfront Key Pairs** and create your key pair. Make sure you download the private key after creation and note the **key ID** (which is also in the filename of the downloaded key). You must download the **Public(rsa)** and **Private(pk)** key .pem extension and save the **Key ID**.

Create S3 bucket “**aaaaaaaaaaabbbbbb**” and upload some files into it.

![](https://cdn-images-1.medium.com/max/1000/1*iOyrBwZmhTw4qdinwwrz0A.png)

In cloudfront distribution security, create **Origin Access Identity**, which is a special CloudFront user, and associate the origin access identity with your distribution. (For web distributions, you associate the origin access identity with origins, so you can secure all or just some of your Amazon S3 content.) You can also create an origin access identity and add it to your distribution when you create the distribution. only the origin access identity has read permission (or read and download permission). When your users access your Amazon S3 objects through CloudFront, the CloudFront origin access identity gets the objects on behalf of your users. If your users request objects directly by using Amazon S3 URLs, they’re denied access. The origin access identity has permission to access objects in your Amazon S3 bucket, but users don’t.

Create CloudFront Distribution for Web.

![](https://cdn-images-1.medium.com/max/1000/1*89yg3MErv3X3koby_1gwLA.png)

![](https://cdn-images-1.medium.com/max/1000/1*-9bx-i9_bS-zlX-JIiw7LA.png)

Hit Create distribution.

After creating the distribution you can see the bucket policy

{% highlight js %}
{
 "Version": "2008-10-17",
 "Id": "PolicyForCloudFrontPrivateContent",
 "Statement": [
   {
   "Sid": "1",
   "Effect": "Allow",
   "Principal": {
       "AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity your_OAI_ID"
    },
       "Action": "s3:GetObject",
       "Resource": "arn:aws:s3:::aaaaaaaaaaabbbbbb/"
    }
  ]
}
{% endhighlight %}

Generate a signed URL using python sdk for aws. Create a script “**boto3_signed_url.py**”.

The script :
{% highlight js %}
import datetime
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import padding
from botocore.signers import CloudFrontSigner
def rsa_signer(message):
#### .pem is the private keyfile downloaded from CloudFront keypair
with open('pk-MOUPJHBLKJN65L1BH.pem', 'rb') as key_file:
private_key = serialization.load_pem_private_key(
key_file.read(),
password=None,
backend=default_backend()
)
signer = private_key.signer(padding.PKCS1v15(), hashes.SHA1())
signer.update(message)
return signer.finalize()
key_id = 'MOUPJHBLKJN65L1BH'
url = 'https://u09vcb1sd98xfb.cloudfront.net/rt.png'
current_time = datetime.datetime.utcnow()
expire_date = current_time + datetime.timedelta(minutes = 2)
cloudfront_signer = CloudFrontSigner(key_id, rsa_signer)
# Create a signed url that will be valid until the specfic expiry date
# provided using a canned policy.
signed_url = cloudfront_signer.generate_presigned_url(
url, date_less_than=expire_date)
print(signed_url)
{% endhighlight %}


Run the script:

python boto3_signed_url.py

This will return a signed URL of that .png file. Paste the url in your browser, you’ll get the image.

## Inline HTML elements

HTML defines a long list of available inline tags, a complete list of which can be found on the [Mozilla Developer Network](https://developer.mozilla.org/en-US/docs/Web/HTML/Element).

- **To bold text**, use `<strong>`.
- *To italicize text*, use `<em>`.
- Abbreviations, like <abbr title="HyperText Markup Langage">HTML</abbr> should use `<abbr>`, with an optional `title` attribute for the full phrase.
- Citations, like <cite>&mdash; Mark otto</cite>, should use `<cite>`.
- <del>Deleted</del> text should use `<del>` and <ins>inserted</ins> text should use `<ins>`.
- Superscript <sup>text</sup> uses `<sup>` and subscript <sub>text</sub> uses `<sub>`.

Most of these elements are styled by browsers with few modifications on our part.

## Heading

Vivamus sagittis lacus vel augue rutrum faucibus dolor auctor. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.

### Code

Cum sociis natoque penatibus et magnis dis `code element` montes, nascetur ridiculus mus.



Aenean lacinia bibendum nulla sed consectetur. Etiam porta sem malesuada magna mollis euismod. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa.

### Lists

Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Aenean lacinia bibendum nulla sed consectetur. Etiam porta sem malesuada magna mollis euismod. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.

* Praesent commodo cursus magna, vel scelerisque nisl consectetur et.
* Donec id elit non mi porta gravida at eget metus.
* Nulla vitae elit libero, a pharetra augue.

Donec ullamcorper nulla non metus auctor fringilla. Nulla vitae elit libero, a pharetra augue.

1. Vestibulum id ligula porta felis euismod semper.
2. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.
3. Maecenas sed diam eget risus varius blandit sit amet non magna.

Cras mattis consectetur purus sit amet fermentum. Sed posuere consectetur est at lobortis.

<dl>
  <dt>HyperText Markup Language (HTML)</dt>
  <dd>The language used to describe and define the content of a Web page</dd>

  <dt>Cascading Style Sheets (CSS)</dt>
  <dd>Used to describe the appearance of Web content</dd>

  <dt>JavaScript (JS)</dt>
  <dd>The programming language used to build advanced Web sites and applications</dd>
</dl>

Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Nullam quis risus eget urna mollis ornare vel eu leo.

### Tables

Aenean lacinia bibendum nulla sed consectetur. Lorem ipsum dolor sit amet, consectetur adipiscing elit.

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Upvotes</th>
      <th>Downvotes</th>
    </tr>
  </thead>
  <tfoot>
    <tr>
      <td>Totals</td>
      <td>21</td>
      <td>23</td>
    </tr>
  </tfoot>
  <tbody>
    <tr>
      <td>Alice</td>
      <td>10</td>
      <td>11</td>
    </tr>
    <tr>
      <td>Bob</td>
      <td>4</td>
      <td>3</td>
    </tr>
    <tr>
      <td>Charlie</td>
      <td>7</td>
      <td>9</td>
    </tr>
  </tbody>
</table>

Nullam id dolor id nibh ultricies vehicula ut id elit. Sed posuere consectetur est at lobortis. Nullam quis risus eget urna mollis ornare vel eu leo.

-----

Want to see something else added? <a href="https://github.com/poole/poole/issues/new">Open an issue.</a>

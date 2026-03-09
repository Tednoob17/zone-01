import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

class ArchiveViewPage extends StatefulWidget {
  const ArchiveViewPage({
    required this.title,
    this.url,
    this.html,
    super.key,
  });

  final String title;
  final String? url;
  final String? html;

  @override
  State<ArchiveViewPage> createState() => _ArchiveViewPageState();
}

class _ArchiveViewPageState extends State<ArchiveViewPage> {
  late final WebViewController _controller;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.disabled)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (_) => setState(() => _loading = true),
          onPageFinished: (_) => setState(() => _loading = false),
        ),
      );

    final html = widget.html;
    final url = widget.url;
    if (html != null && html.isNotEmpty) {
      _controller.loadHtmlString(html);
    } else if (url != null && url.isNotEmpty) {
      _controller.loadRequest(Uri.parse(url));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.title)),
      body: Stack(
        children: [
          WebViewWidget(controller: _controller),
          if (_loading)
            const Align(
              alignment: Alignment.topCenter,
              child: LinearProgressIndicator(minHeight: 3),
            ),
        ],
      ),
    );
  }
}

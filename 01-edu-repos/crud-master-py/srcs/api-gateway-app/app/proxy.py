from flask import Blueprint, request, jsonify

import os
import requests

INVENTORY_APP_HOST = os.getenv("INVENTORY_APP_HOST")
INVENTORY_APP_PORT = os.getenv("INVENTORY_APP_PORT")


bp = Blueprint("proxy", __name__)


@bp.route('/<path:path>', methods=["GET", "POST", "PUT", "DELETE"])
def gateway(path: str):
    service_mapping = {
        "movies":
            f'http://{INVENTORY_APP_HOST}:{INVENTORY_APP_PORT}',

    }

    path_parts = path.split('/')
    service_name = path_parts[1] if len(path_parts) > 1 else None
    target_service = service_mapping.get(service_name)

    if target_service:
        try:
            response = requests.request(
                method=request.method,
                url=f"{target_service}/{path}",
                headers=request.headers,
                data=request.get_data(),
                params=request.args
            )
            return (
                response.text,
                response.status_code,
                response.headers.items()
            )

        except Exception as e:
            return jsonify(error=f"{e}"), 500
    else:
        return jsonify({'error': 'Service not found'}), 404
